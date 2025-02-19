<svelte:options
    customElement={{
        tag: "lens-chart",
    }}
/>

<script lang="ts">
    import Chart, { type ChartTypeRegistry } from "chart.js/auto";
    import { onMount } from "svelte";
    import {
        getAggregatedPopulation,
        getAggregatedPopulationForStratumCode,
        getStratifierCodesForGroupCode,
        responseStore,
    } from "../../stores/response";
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { catalogue } from "../../stores/catalogue";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import type { Category, Criteria } from "../../types/treeData";
    import { catalogueKeyToResponseKeyMap } from "../../stores/mappings";
    import type { ResponseStore } from "../../types/backend";
    import type { Site } from "../../types/response";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import { lensOptions } from "../../stores/options";
    import type { ChartOption } from "../../types/options";
    import type { ChartDataSets } from "../../types/charts";

    export let title: string = ""; // e.g. 'Gender Distribution'
    export let catalogueGroupCode: string = ""; // e.g. "gender"
    export let indexAxis: string = "x";
    export let xAxisTitle: string = "";
    export let yAxisTitle: string = "";
    export let clickToAddState: boolean = false;
    let responseGroupCode: string;
    $: responseGroupCode =
        $catalogueKeyToResponseKeyMap.get(catalogueGroupCode) || "";

    export let headers: Map<string, string> = new Map<string, string>();
    export let displayLegends: boolean = false;
    export let chartType: keyof ChartTypeRegistry = "pie";
    export let scaleType: string = "linear";
    export let perSite: boolean = false;
    export let groupRange: number = 0;
    export let groupingDivider: string = "";
    export let filterRegex: string = "";
    export let groupingLabel: string = "";
    export let viewScales: boolean = chartType !== "pie" ? true : false;
    let options: ChartOption;
    $: options =
        ($lensOptions?.chartOptions &&
            $lensOptions?.chartOptions[catalogueGroupCode]) ||
        ({} as ChartOption);

    export let backgroundColor: string[] | string = [
        "#4dc9f6",
        "#f67019",
        "#f53794",
        "#537bc4",
        "#acc236",
        "#166a8f",
        "#00a950",
        "#58595b",
        "#8549ba",
        "#ff8a33",
        "#ff5996",
        "#8ace7e",
        "#c789d6",
        "#ffcc00",
        "#7fc2f4",
        "#969696",
        "#cfd27e",
        "#db843d",
        "#89a54e",
        "#80699b",
    ];
    export let backgroundHoverColor: string[] = ["#aaaaaa"];

    /**
     * initialize the chart
     */

    let noDataAvailable: boolean = false;

    let canvas!: HTMLCanvasElement;

    let chart: Chart;

    // TODO: Use ChartConfiguration type here instead of "any"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let initialChartData: any = {
        type: chartType,
        data: {
            labels: ["", "", "", ""],
            datasets: [
                {
                    data: [1, 1, 1, 1],
                    backgroundColor: ["#E6E6E6"],
                    backgroundHoverColor: ["#E6E6E6"],
                },
            ],
        },
        options: {
            indexAxis: indexAxis,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: displayLegends,
                    position: "bottom",
                },
                tooltip: {
                    callbacks: {
                        title: (
                            context: {
                                [key: string]: unknown;
                                label: string;
                            }[],
                        ) => {
                            const key = context[0].label || "";
                            let result =
                                options.tooltips && options.tooltips[key]
                                    ? options.tooltips[key]
                                    : key;
                            return result;
                        },
                    },
                },
            },
            scales: {
                y: {
                    display: viewScales,
                    title: {
                        display: true,
                        text: yAxisTitle,
                    },
                },
                x: {
                    display: viewScales,
                    title: {
                        display: true,
                        text: xAxisTitle,
                    },
                    ticks:
                        chartType === "bar"
                            ? {
                                  callback: (val: string | number) => {
                                      if (indexAxis === "y")
                                          return val.toString();
                                      if (typeof val === "string") return val;
                                      const key: unknown =
                                          initialChartData.data.labels[val] !==
                                          undefined
                                              ? initialChartData.data.labels[
                                                    val
                                                ]
                                              : val.toString();
                                      if (typeof key !== "string")
                                          return val.toString();
                                      let result = headers.get(key)
                                          ? headers.get(key)
                                          : key;
                                      return result;
                                  },
                              }
                            : [],
                    type: undefined,
                },
            },
        },
    };

    const accumulateValues = (
        responseStore: ResponseStore,
        valuesToAccumulate: string[],
        catalogueGroupCode: string,
    ): number => {
        let aggregatedData = 0;

        valuesToAccumulate.forEach((value: string) => {
            aggregatedData += getAggregatedPopulationForStratumCode(
                responseStore,
                value,
                catalogueGroupCode,
            );
        });
        return aggregatedData;
    };

    /**
     * gets the aggregated population for a given stratum code
     * @param responseStore - the response store
     * @param chartLabels - the labels for the chart
     * @returns an array of chart data sets from the response store
     */
    const getChartDataSets = (
        responseStore: ResponseStore,
        chartLabels: string[],
    ): ChartDataSets => {
        let dataSet: number[];

        // This is bad. For some reason the passed value is a string not a array of strings. With this conversion it does work!
        if (typeof backgroundColor == "string") {
            backgroundColor = backgroundColor.split(",");
        }

        if (perSite) {
            dataSet = chartLabels.map((label: string) => {
                const site: Site | undefined = responseStore.get(label);

                if (site === undefined || site.status !== "succeeded") return 0;

                let data = site?.data?.group?.find(
                    (groupItem) => groupItem.code.text === catalogueGroupCode,
                );
                return data?.population[0]?.count || 0;
            });

            let remove_indexes: number[] = [];

            dataSet.forEach((value, index) => {
                if (value === 0) {
                    remove_indexes.unshift(index);
                }
            });

            remove_indexes.forEach((index) => {
                dataSet.splice(index, 1);
                chartLabels.splice(index, 1);
            });

            return {
                labels: chartLabels,
                data: [
                    {
                        data: dataSet,
                        backgroundColor,
                        backgroundHoverColor,
                    },
                ],
            };
        }

        const combinedSubGroupData = combineSubGroups(
            groupingDivider,
            responseStore,
            chartLabels,
        );

        /**
         * if aggregations are set, aggregate the data from other groups and adds them to the chart
         * e.g. add aggregated number of medical statements to the chart for therapy of tumor
         */
        if (options.aggregations) {
            options.aggregations.forEach((aggregation) => {
                const aggregationCount = getAggregatedPopulation(
                    responseStore,
                    aggregation,
                );
                combinedSubGroupData.data.push(aggregationCount);
                combinedSubGroupData.labels.push(aggregation);
            });
        }

        /**
         * if accumulated values are set, accumulate the values of the given stratum codes and adds them to the chart
         * e.g. {name: "frozen-tissue", values: ["tissue-frozen","tissue-ffpe"]}
         * will remove the values from the chart and add their accumulated value to "frozen-tissue"
         */
        if (
            options.accumulatedValues !== undefined &&
            options.accumulatedValues.length > 0
        ) {
            options.accumulatedValues.forEach((valueToAccumulate) => {
                const aggregationCount: number = accumulateValues(
                    responseStore,
                    valueToAccumulate.values,
                    catalogueGroupCode,
                );
                if (aggregationCount > 0) {
                    combinedSubGroupData.data.push(aggregationCount);
                    combinedSubGroupData.labels.push(valueToAccumulate.name);

                    for (
                        let i = 0;
                        i < combinedSubGroupData.labels.length;
                        i++
                    ) {
                        const element: string = combinedSubGroupData.labels[i];
                        if (valueToAccumulate.values.includes(element)) {
                            combinedSubGroupData.labels.splice(i, 1);
                            combinedSubGroupData.data.splice(i, 1);
                            i--;
                        }
                    }
                }
            });
        }

        return {
            labels: combinedSubGroupData.labels,
            data: [
                {
                    data: combinedSubGroupData.data,
                    backgroundColor,
                    backgroundHoverColor,
                },
            ],
        };
    };

    /**
     * filters the labels by the given regex
     * @param labels - the labels to filter
     * @returns the filtered labels
     */
    const filterRegexMatch = (labels: string[]): string[] => {
        if (filterRegex === null) return labels;
        return labels.filter((label) => label.match(filterRegex));
    };

    /**
     * combines subgroups into their supergroups like C30, C31.1 and C31.2 into C31
     * @param divider the divider used to split the labels
     * @param responseStore the response store
     * @param labels the labels to combine
     * @returns the combined labels and their data
     */
    const combineSubGroups = (
        divider: string,
        responseStore: ResponseStore,
        labels: string[],
    ): { labels: string[]; data: number[] } => {
        const groupedChartData: { label: string; value: number }[] =
            labels.reduce<{ label: string; value: number }[]>((acc, label) => {
                // This is a hack! This will help with the wrong coding of ICD10
                label = label.replaceAll("_", ".");

                /**
                 * see if the label contains the divider
                 * if not, add it to the accumulator with a .% at the end
                 */
                if (!label.includes(divider) || divider === "") {
                    return [
                        ...acc,
                        {
                            label: label + groupingLabel,
                            value: getAggregatedPopulationForStratumCode(
                                responseStore,
                                label,
                                responseGroupCode,
                            ),
                        },
                    ];
                }

                /**
                 * if the label contains the divider, find the corresponding super class item
                 * if it doesn't exist, create it
                 * add the value of the current label to the value of the super class item
                 * and add it to the accumulator
                 */
                let superClassItem:
                    | { label: string; value: number }
                    | undefined = acc.find(
                    (item) =>
                        item.label === label.split(divider)[0] + groupingLabel,
                );

                if (!superClassItem) {
                    superClassItem = {
                        label: label.split(divider)[0] + groupingLabel,
                        value: 0,
                    };
                }

                superClassItem.value += getAggregatedPopulationForStratumCode(
                    responseStore,
                    label,
                    responseGroupCode,
                );

                return [
                    ...acc.filter(
                        (item) =>
                            item.label !==
                            label.split(divider)[0] + groupingLabel,
                    ),
                    superClassItem,
                ];
            }, []);

        return {
            labels: groupedChartData.map((item) => item.label),
            data: groupedChartData.map((item) => item.value),
        };
    };

    /**
     * watches the response store and updates the chart data
     * @param responseStore - the response store
     */
    const setChartData = (responseStore: ResponseStore): void => {
        if (responseStore.size === 0) {
            return;
        }

        let chartLabels: string[] = [];

        if (perSite) {
            responseStore.forEach((value: Site, key: string) => {
                chartLabels.push(key);
            });
        } else {
            chartLabels = getStratifierCodesForGroupCode(
                responseStore,
                responseGroupCode,
            );
        }
        chartLabels = filterRegexMatch(chartLabels);
        chartLabels.sort(customSort);

        /**
         * remove labels and their corresponding data if the label is an empty string or null
         */
        chartLabels = chartLabels.filter(
            (label) => label !== "" && label !== null && label !== "null",
        );

        /**
         * get the chart data sets from the response store
         * will be aggregated in groups if a divider is set
         * eg. 'C30', 'C31.1', 'C31.2' -> 'C31' when divider is '.'
         */
        let chartData: ChartDataSets = getChartDataSets(
            responseStore,
            chartLabels,
        );

        // If the chart is empty and no responses are pending show "No Data Available"
        noDataAvailable =
            chartData.data[0].data.every((value) => value === 0) &&
            !Array.from(responseStore.values()).some(
                (response) => response.status === "claimed",
            );

        chart.data.datasets = chartData.data;
        chartLabels = chartData.labels;

        if (typeof groupRange == "string") {
            groupRange = Number(groupRange);
        }

        /**
         * lets the user define a range for the labels when only single values are used eg. '60' -> '60 - 69'
         */
        if (groupRange !== undefined && groupRange !== 0) {
            chartLabels = chartLabels.map((label) => {
                /**
                 * check if label doesn't parse to a number
                 */
                if (isNaN(parseInt(label))) return label;

                return `${parseInt(label)} - ${
                    parseInt(label) + groupRange - 1
                }`;
            });
        }

        /**
         * set the labels of the chart
         * if a legend mapping is set, use the legend mapping
         */
        chart.data.labels = options.legendMapping
            ? chartLabels.map((label) => {
                  return (
                      (options.legendMapping && options.legendMapping[label]) ||
                      ""
                  );
              })
            : chartLabels;

        chart.update();
    };

    $: {
        setChartData($responseStore);
    }

    onMount(() => {
        if (indexAxis === "y") {
            initialChartData.options.scales.x.type = scaleType;
        } else {
            initialChartData.options.scales.y.type = scaleType;
        }
        chart = new Chart(canvas, initialChartData);
    });

    const customSort = (a: string, b: string): number => {
        // "unknown" should come after numeric values
        if (a === "unknown" && b !== "unknown") {
            return 1;
        }
        // Numeric values should come before "unknown"
        if (a !== "unknown" && b === "unknown") {
            return -1;
        }
        // Convert numeric values to numbers for comparison
        if (!isNaN(parseInt(a)) && !isNaN(parseInt(b))) {
            const aNum = parseInt(a, 10);
            const bNum = parseInt(b, 10);
            return aNum > bNum ? 1 : -1;
        }

        return a > b ? 1 : -1;
    };

    /**
     * adds stratifier as a search parameter when clicked
     */
    const handleClickOnStratifier = (): void => {
        /**
         * the clicked stratifier
         */
        const stratifier = chart.getActiveElements()[0];
        if (!stratifier || !clickToAddState) return;
        const label: string = chart.data.labels
            ? (chart.data.labels[stratifier.index] as string)
            : "";
        let queryItem!: QueryItem;
        $catalogue.forEach((parentCategory: Category) => {
            if ("childCategories" in parentCategory) {
                parentCategory.childCategories?.forEach(
                    (childCategorie: Category) => {
                        if (
                            childCategorie.key === catalogueGroupCode &&
                            "criteria" in childCategorie
                        ) {
                            let values: QueryValue[] = [];

                            if (childCategorie.fieldType === "number") {
                                /**
                                 * TODO: add customisation for the step size
                                 */
                                values = [
                                    {
                                        name: `${label}`,
                                        value: {
                                            min: parseInt(label),
                                            max:
                                                parseInt(label) +
                                                groupRange -
                                                1,
                                        },
                                        queryBindId: uuidv4(),
                                    },
                                ];
                            } else {
                                childCategorie.criteria.forEach(
                                    (criterion: Criteria) => {
                                        if (
                                            criterion.key === label ||
                                            criterion.name === label
                                        ) {
                                            values[0] = {
                                                name: criterion.name,
                                                value: criterion.key,
                                                queryBindId: uuidv4(),
                                                description:
                                                    criterion.description,
                                            };
                                        }
                                    },
                                );
                            }

                            queryItem = {
                                id: uuidv4(),
                                key: childCategorie.key,
                                name: childCategorie.name,
                                system:
                                    "system" in childCategorie
                                        ? childCategorie.system
                                        : "",
                                type:
                                    "type" in childCategorie
                                        ? childCategorie.type
                                        : "BETWEEN",
                                values: values,
                            };

                            addItemToQuery(queryItem, $activeQueryGroupIndex);
                        }
                    },
                );
            }
        });

        addItemToQuery(queryItem, $activeQueryGroupIndex);
    };
</script>

<div part="chart-wrapper">
    <h4 part="chart-title">{title}</h4>
    {#if options.hintText}
        <InfoButtonComponent message={options.hintText} />
    {/if}

    {#if noDataAvailable}
        <div part="chart-overlay">
            <p part="no-data-available">No Data Available</p>
        </div>
    {/if}

    <canvas
        part="chart-canvas"
        bind:this={canvas}
        id="chart"
        on:click={handleClickOnStratifier}
    />
    <slot />
</div>
