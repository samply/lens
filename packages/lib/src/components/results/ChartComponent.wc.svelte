<svelte:options
    customElement={{
        tag: "lens-chart",
        props: {
            chartData: { type: "Object" },
            backgroundColor: { type: "Array" },
            backgroundHoverColor: { type: "Array" },
            perSite: { type: "Boolean" },
            groupRange: { type: "Number" },
        },
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

    export let title: string = ""; // e.g. 'Gender Distribution'
    export let catalogueGroupCode: string = ""; // e.g. "gender"
    export let indexAxis: string = "x";
    export let xAxisTitle: string = "";
    export let yAxisTitle: string = "";
    export let clickToAddState: boolean = false;
    let responseGroupCode: string;
    $: responseGroupCode =
        $catalogueKeyToResponseKeyMap.get(catalogueGroupCode);

    export let tooltips: Map<string, string> = new Map<string, string>();
    export let headers: Map<string, string> = new Map<string, string>();
    export let displayLegends: boolean = false;
    export let chartType: keyof ChartTypeRegistry = "pie";
    export let perSite: boolean = false;
    export let groupRange: number | null = null;
    export let groupingDivider: string | null = null;
    export let filterRegex: string | null = null;
    export let groupingLabel: string = "";
    export let viewScales: boolean = chartType !== "pie" ? true : false;

    let options: any;
    $: options =
        ($lensOptions?.chartOptions &&
            $lensOptions?.chartOptions[catalogueGroupCode]) ||
        {};

    export let backgroundColor: string[] = [
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
    let canvas!: HTMLCanvasElement;

    let chart: Chart;

    let initialChartData = {
        type: chartType,
        data: {
            labels: ["", "", "", ""],
            datasets: [
                {
                    label: "",
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
                        title: (context: any) => {
                            const key = context[0].label || "";
                            let result = options.tooltips && options.tooltips[key]
                                ? options.tooltips[key]
                                : key
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
                                  callback: (val: any) => {
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
                },
            },
        },
    };

    /**
     * @param chartLabels
     * @returns an array of chart data sets from the response store
     */
    const getChartDataSets = (
        responseStore: ResponseStore,
        chartLabels: string[]
    ): {
        labels: string[];
        data: { label; data; backgroundColor; backgroundHoverColor }[];
    } => {
        let dataSet: number[];

        if (perSite) {
            dataSet = chartLabels.map((label: string) => {
                const site: Site = responseStore.get(label);

                if (site.data === null) return 0;

                let data = site.data.group.find(
                    (groupItem) => groupItem.code.text === catalogueGroupCode
                );
                return data?.population[0]?.count || 0;
            });

            return {
                labels: chartLabels,
                data: [
                    {
                        label: "",
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
            chartLabels
        );


        /**
         * if aggregations are set, aggregate the data from other groups and adds them to the chart
         * e.g. add aggregated number of medical statements to the chart for therapy of tumor
        */
        if(options.aggregations){
            options.aggregations.forEach((aggregation) => {
                const aggregationCount = getAggregatedPopulation(responseStore, aggregation);
                combinedSubGroupData.data.push(aggregationCount);
                combinedSubGroupData.labels.push(aggregation);
            });
        }

        return {
            labels: combinedSubGroupData.labels,
            data: [
                {
                    label: "",
                    data: combinedSubGroupData.data,
                    backgroundColor,
                    backgroundHoverColor,
                },
            ],
        };
    };

    /**
     * filters the labels by the given regex
     * @param labels
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
        labels: string[]
    ): { labels: string[]; data: number[] } => {
        const groupedChartData: { label: string; value: number }[] =
            labels.reduce((acc, label) => {
                /**
                 * see if the label contains the divider
                 * if not, add it to the accumulator with a .% at the end
                 */
                if (!label.includes(divider)) {
                    return [
                        ...acc,
                        {
                            label: label + groupingLabel,
                            value: getAggregatedPopulationForStratumCode(
                                responseStore,
                                label,
                                responseGroupCode
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
                let superClassItem: { label: string; value: number } = acc.find(
                    (item) =>
                        item.label === label.split(divider)[0] + groupingLabel
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
                    responseGroupCode
                );

                return [
                    ...acc.filter(
                        (item) =>
                            item.label !==
                            label.split(divider)[0] + groupingLabel
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
     */
    const setChartData = (responseStore: ResponseStore) => {
        if (responseStore.size === 0) return;

        let isDataAvailable: boolean = false;

        responseStore.forEach((value, key) => {
            if (value.data !== null) isDataAvailable = true;
        });

        if (!isDataAvailable) return;

        let chartLabels: string[] = [];

        if (perSite) {
            responseStore.forEach(
                (value: Site, key: string, map: ResponseStore) => {
                    chartLabels.push(key);
                }
            );
        } else {
            chartLabels = getStratifierCodesForGroupCode(
                responseStore,
                responseGroupCode
            );
        }
        chartLabels = filterRegexMatch(chartLabels);
        chartLabels.sort(customSort);

        /**
         * remove labels and their corresponding data if the label is an empty string or null
         */
        chartLabels = chartLabels.filter(
            (label) => label !== "" && label !== null && label !== "null"
        );

        /**
         * get the chart data sets from the response store
         * will be aggregated in groups if a divider is set
         * eg. 'C30', 'C31.1', 'C31.2' -> 'C31' when divider is '.'
         */
        let chartData = getChartDataSets(responseStore, chartLabels);
        chart.data.datasets = chartData.data;
        chartLabels = chartData.labels;

        /**
         * lets the user define a range for the labels when only single values are used eg. '60' -> '60 - 69'
         */
        if (groupRange !== null) {
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
        chart.data.labels = options.legendMapping ? chartLabels.map(label => {
            return options.legendMapping[label]
        }): chartLabels;

        chart.update();
    };

    $: {
        setChartData($responseStore);
    }

    onMount(() => {
        chart = new Chart(canvas, initialChartData);
    });

    const customSort = (a, b): number => {
        // "unknown" should come after numeric values
        if (a === "unknown" && b !== "unknown") {
            return 1;
        }
        // Numeric values should come before "unknown"
        if (a !== "unknown" && b === "unknown") {
            return -1;
        }
        // Convert numeric values to numbers for comparison
        if(!isNaN(a) && !isNaN(b)) {
            a = parseInt(a, 10);
            b = parseInt(b, 10);
        }
        
        return a > b ? 1 : -1;


    };

    /**
     * adds stratifier as a search parameter when clicked
     *
     */
    const handleClickOnStratifier = () => {
        /**
         * the clicked stratifier
         */
        const stratifier = chart.getActiveElements()[0];
        if (!stratifier || !clickToAddState) return;
        const label: string = chart.data.labels[stratifier.index] as string;
        let queryItem: QueryItem;
        $catalogue.forEach((parentCategory: Category) => {
            if ("childCategories" in parentCategory) {
                parentCategory.childCategories.forEach(
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
                                        if (criterion.key === label) {
                                            values[0] = {
                                                name: criterion.name,
                                                value: criterion.key,
                                                queryBindId: uuidv4(),
                                                description:
                                                    criterion.description,
                                            };
                                        }
                                    }
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
                    }
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
    <canvas
        part="chart-canvas"
        bind:this={canvas}
        id="chart"
        on:click={handleClickOnStratifier}
    />
    <slot></slot>
</div>
