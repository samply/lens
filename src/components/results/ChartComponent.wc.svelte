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
    import type { Category, Criteria } from "../../types/catalogue";
    import type { ResponseStore } from "../../types/backend";
    import type { Site } from "../../types/response";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import { lensOptions } from "../../stores/options";
    import type { ChartOption } from "../../types/options";
    import type { ChartDataSets } from "../../types/charts";

    interface Props {
        title?: string; // e.g. 'Gender Distribution'
        catalogueGroupCode?: string; // e.g. "gender"
        indexAxis?: string;
        xAxisTitle?: string;
        yAxisTitle?: string;
        clickToAddState?: boolean;
        headers?: Map<string, string>;
        displayLegends?: boolean;
        chartType?: keyof ChartTypeRegistry;
        scaleType?: string;
        perSite?: boolean;
        groupRange?: number;
        groupingDivider?: string;
        filterRegex?: string;
        groupingLabel?: string;
        viewScales?: boolean;
        backgroundColor?: string[] | string;
        backgroundHoverColor?: string[];
    }

    let {
        title = "",
        catalogueGroupCode = "",
        indexAxis = "x",
        xAxisTitle = "",
        yAxisTitle = "",
        clickToAddState = false,
        headers = new Map<string, string>(),
        displayLegends = false,
        chartType = "pie",
        scaleType = "linear",
        perSite = false,
        groupRange = $bindable(0),
        groupingDivider = "",
        filterRegex = "",
        groupingLabel = "",
        viewScales = chartType !== "pie" ? true : false,
        backgroundColor = $bindable([
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
        ]),
        backgroundHoverColor = ["#aaaaaa"],
    }: Props = $props();

    // This is undefined if the lens options are not loaded yet
    let options: ChartOption | undefined = $derived(
        $lensOptions?.chartOptions?.[catalogueGroupCode],
    );

    let responseGroupCode: string = $derived(
        new Map($lensOptions?.catalogueKeyToResponseKeyMap).get(
            catalogueGroupCode,
        ) || "",
    );

    /**
     * initialize the chart
     */

    let noDataAvailable: boolean = $state(false);

    let canvas: HTMLCanvasElement;

    let chart: Chart;

    // TODO: Use ChartConfiguration type here instead of "any"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let initialChartData: any = {
        type: chartType,
        data: {
            labels: ["", "", "", ""],
            datasets: [
                {
                    data: [3, 1, 2, 5],
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
                                options?.tooltips !== undefined &&
                                options.tooltips[key] !== undefined
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
                    suggestedMax: 6,
                    title: {
                        display: true,
                        text: yAxisTitle,
                    },
                },
                x: {
                    display: viewScales,
                    suggestedMax: 6,
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
        valuesToAccumulate: string[],
        catalogueGroupCode: string,
    ): number => {
        let aggregatedData = 0;

        valuesToAccumulate.forEach((value: string) => {
            aggregatedData += getAggregatedPopulationForStratumCode(
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
        if (options?.aggregations !== undefined) {
            options.aggregations.forEach((aggregation) => {
                const aggregationCount = getAggregatedPopulation(aggregation);
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
            options?.accumulatedValues !== undefined &&
            options.accumulatedValues.length > 0
        ) {
            options.accumulatedValues.forEach((valueToAccumulate) => {
                const aggregationCount: number = accumulateValues(
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
        const labelsToData = new Map<string, number>();
        for (const label of labels) {
            const value = getAggregatedPopulationForStratumCode(
                label,
                responseGroupCode,
            );

            if (!label.includes(divider) || divider === "") {
                /*
                 * see if the label contains the divider
                 * if not, add it to the accumulator with a grouping label (.%) at the end
                 */
                labelsToData.set(label + groupingLabel, value);
            } else {
                /*
                 * if the label contains the divider, find the corresponding super class item
                 * if it doesn't exist, create it
                 * add the value of the current label to the value of the super class item
                 */
                const superClassLabel = label.split(divider)[0] + groupingLabel;
                let oldValue = labelsToData.get(superClassLabel);
                labelsToData.set(
                    superClassLabel,
                    oldValue ? oldValue + value : value,
                );
            }
        }

        return {
            labels: Array.from(labelsToData.keys()),
            data: Array.from(labelsToData.values()),
        };
    };

    const calculateStepSize = (max: number) => {
        const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
        const normalized = max / magnitude;

        let step;
        if (normalized <= 2) step = 2;
        else if (normalized <= 5) step = 5;
        else step = 10;

        return (step * magnitude) / 10;
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
            chartLabels = getStratifierCodesForGroupCode(responseGroupCode);
            // log return and params
            console.log(responseStore);
            console.log(
                "getStratifierCodesForGroupCode",
                responseGroupCode,
                chartLabels,
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
        chart.data.labels =
            options?.legendMapping !== undefined
                ? chartLabels.map(
                      (label) => options.legendMapping?.[label] || "",
                  )
                : chartLabels;

        let max = Math.max(
            ...chartData.data.map((dataset) => Math.max(...dataset.data)),
        );
        const stepSize = calculateStepSize(max);

        const yMax = Math.ceil((max + 1) / stepSize) * stepSize;

        if (
            indexAxis === "x" &&
            chart.options.scales !== undefined &&
            chart.options.scales.y !== undefined
        ) {
            chart.options.scales.y.max = yMax;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            chart.options.scales.y.ticks.stepSize = stepSize;
        }
        if (
            indexAxis === "y" &&
            chart.options.scales !== undefined &&
            chart.options.scales.x !== undefined
        ) {
            chart.options.scales.x.max = yMax;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            chart.options.scales.x.ticks.stepSize = stepSize;
        }

        chart.update();
    };

    /*
     * clear charts
     */
    export function resetChart() {
        if (!chart) return;

        chart.data.labels = ["", "", "", ""];
        chart.data.datasets = [
            {
                data: [3, 1, 2, 5],
                backgroundColor: ["#E6E6E6"],
                hoverBackgroundColor: ["#E6E6E6"],
            },
        ];
        noDataAvailable = false;

        chart.update();
    }

    onMount(() => {
        if (indexAxis === "y") {
            initialChartData.options.scales.x.type = scaleType;
        } else {
            initialChartData.options.scales.y.type = scaleType;
        }
        chart = new Chart(canvas, initialChartData); // Store the Chart instance
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
                            (childCategorie.fieldType === "single-select" ||
                                childCategorie.fieldType === "autocomplete" ||
                                childCategorie.fieldType === "number")
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

    $effect(() => {
        setChartData($responseStore);
    });
</script>

<div part="chart-wrapper">
    <h4 part="chart-title">{title}</h4>
    {#if options?.hintText !== undefined}
        <InfoButtonComponent message={options.hintText} />
    {/if}

    {#if noDataAvailable}
        <div part="chart-overlay">
            <p part="no-data-available">No Data Available</p>
        </div>
    {/if}

    <!-- For responsive charts, Charts.js requires a dedicated container for each canvas: https://www.chartjs.org/docs/latest/configuration/responsive.html#important-note -->
    <!-- The container requires `min-width: 0` or it won't shrink: https://github.com/chartjs/Chart.js/issues/4156#issuecomment-295180128 -->
    <div part="container-min-width-0">
        <canvas
            part="chart-canvas"
            bind:this={canvas}
            id="chart"
            onclick={handleClickOnStratifier}
        ></canvas>
    </div>
    <slot />
</div>

<style>
    [part~="container-min-width-0"] {
        min-width: 0;
    }

    [part~="chart-wrapper"] {
        height: 100%;
        display: grid;
        position: relative;
        background-color: var(--white);
    }

    [part~="chart-overlay"] {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    [part~="no-data-available"] {
        font-weight: bold;
        color: var(--gray);
        background-color: var(--white);
        padding: 0.5em;
    }

    [part~="chart-title"] {
        text-align: center;
        margin: 0;
        padding-bottom: var(--gap-m);
    }

    [part~="chart-canvas"] {
        width: 100%;
        max-height: 400px;
    }
</style>
