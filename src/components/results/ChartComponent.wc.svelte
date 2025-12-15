<svelte:options
    customElement={{
        tag: "lens-chart",
    }}
/>

<script lang="ts">
    import Chart, { type ChartTypeRegistry } from "chart.js/auto";
    import { onMount } from "svelte";
    import {
        getTotal,
        getStratum,
        getStrata,
        getSiteTotal,
        siteStatus,
        siteResults,
    } from "../../stores/response";
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { catalogue } from "../../stores/catalogue";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import type { Category, Criteria } from "../../types/catalogue";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import { lensOptions } from "../../stores/options";
    import type { ChartOption } from "../../types/options";
    import type { ChartDataSets } from "../../types/charts";
    import { SvelteMap } from "svelte/reactivity";

    interface Props {
        title?: string; // e.g. 'Gender Distribution'
        indexAxis?: string;
        xAxisTitle?: string;
        yAxisTitle?: string;
        clickToAddState?: boolean;
        headers?: Map<string, string>;
        displayLegends?: boolean;
        chartType?: keyof ChartTypeRegistry;
        scaleType?: string;
        dataKey: string;
        enableSorting: boolean;
        perSite?: boolean;
        groupRange?: number;
        groupingDivider?: string;
        filterRegex?: string;
        groupingLabel?: string;
        viewScales?: boolean;
        backgroundColor?: string[];
        hoverBackgroundColor?: string[];
    }

    let {
        title = "",
        indexAxis = "x",
        xAxisTitle = "",
        yAxisTitle = "",
        clickToAddState = false,
        headers = new Map<string, string>(),
        displayLegends = false,
        dataKey = "",
        chartType = "pie",
        scaleType = "linear",
        enableSorting = true,
        perSite = false,
        groupRange = undefined,
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
        hoverBackgroundColor = ["#aaaaaa"],
    }: Props = $props();

    let options: ChartOption | undefined = $derived(
        $lensOptions?.chartOptions?.[dataKey],
    );

    /**
     * initialize the chart
     */

    let noDataAvailable: boolean = $state(false);

    let canvas: HTMLCanvasElement;

    let chart: Chart;

    let sortBy: "alpha" | "value" = $state("alpha"); // 'value' or 'alpha'
    let sortOrder: "asc" | "desc" = $state("asc"); // 'asc' or 'desc'

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

    const accumulateValues = (valuesToAccumulate: string[]): number => {
        let aggregatedData = 0;

        valuesToAccumulate.forEach((value: string) => {
            aggregatedData += getStratum($siteResults, dataKey, value);
        });
        return aggregatedData;
    };

    /**
     * gets the aggregated population for a given stratum code
     * @param chartLabels - the labels for the chart
     * @returns an array of chart data sets from the response store
     */
    const getChartDataSets = (chartLabels: string[]): ChartDataSets => {
        let dataSet: number[];

        if (perSite) {
            dataSet = chartLabels.map((label: string) =>
                getSiteTotal($siteResults, label, dataKey),
            );

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
                        hoverBackgroundColor,
                    },
                ],
            };
        }

        const combinedSubGroupData = combineSubGroups(
            groupingDivider,
            chartLabels,
        );

        /**
         * if aggregations are set, aggregate the data from other groups and adds them to the chart
         * e.g. add aggregated number of medical statements to the chart for therapy of tumor
         */
        if (options?.aggregations !== undefined) {
            options.aggregations.forEach((aggregation) => {
                const aggregationCount = getTotal($siteResults, aggregation);
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
                    hoverBackgroundColor,
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
     * @param labels the labels to combine
     * @returns the combined labels and their data
     */
    const combineSubGroups = (
        divider: string,
        labels: string[],
    ): { labels: string[]; data: number[] } => {
        const labelsToData = new SvelteMap<string, number>();
        for (const label of labels) {
            const value = getStratum($siteResults, dataKey, label);

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
    const setChartData = (
        siteStatus: Map<string, "claimed" | "succeeded">,
        sortBy: "alpha" | "value",
        sortOrder: "asc" | "desc",
    ): void => {
        if (siteStatus.size === 0) {
            return;
        }

        let chartLabels: string[] = [];

        if (perSite) {
            chartLabels.push(...siteStatus.keys());
        } else {
            chartLabels = getStrata($siteResults, dataKey);
        }
        chartLabels = filterRegexMatch(chartLabels);

        if (sortBy === "alpha") {
            chartLabels.sort(SortLabels);
        }

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
        let chartData: ChartDataSets = getChartDataSets(chartLabels);

        // If there is no data, show ghost chart and return early
        if (chartData.data[0].data.every((value) => value === 0)) {
            resetChart();
            if (
                !Array.from(siteStatus.values()).some(
                    (status) => status === "claimed",
                )
            ) {
                // Show "No Data Available" if no responses are pending
                noDataAvailable = true;
            }
            return;
        }

        if (sortBy === "value") {
            chartData = sortChartData(chartData, sortOrder);
        }

        chart.data.datasets = chartData.data;
        chartLabels = chartData.labels;

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

        // Set the chart labels, using either the legend mapping or the site mappings
        if (options?.legendMapping !== undefined) {
            chart.data.labels = chartLabels.map(
                (label) => options.legendMapping?.[label] ?? label,
            );
        } else if (perSite && $lensOptions?.siteMappings !== undefined) {
            chart.data.labels = chartLabels.map(
                (label) => $lensOptions.siteMappings?.[label] ?? label,
            );
        } else {
            chart.data.labels = chartLabels;
        }

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

    function sortChartData(
        chartData: ChartDataSets,
        sortOrder: "asc" | "desc",
    ): ChartDataSets {
        const indices = chartData.labels.map((_, index) => index);

        // Sort indices based on the sorting criteria
        indices.sort((a, b) => {
            let comparison = 0;
            const valueA = chartData.data[0]?.data[a] ?? 0;
            const valueB = chartData.data[0]?.data[b] ?? 0;
            comparison = valueA - valueB;

            return sortOrder === "asc" ? comparison : -comparison;
        });

        return {
            labels: indices.map((i) => chartData.labels[i]),
            data: chartData.data.map((dataset) => ({
                data: indices.map((i) => dataset.data[i]),
                backgroundColor: indices.map(
                    (i, index) =>
                        dataset.backgroundColor[
                            index % dataset.backgroundColor.length
                        ],
                ),
                hoverBackgroundColor: indices.map(
                    (i, index) =>
                        dataset.hoverBackgroundColor[
                            index % dataset.hoverBackgroundColor.length
                        ],
                ),
            })),
        };
    }

    const SortLabels = (a: string, b: string): number => {
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
            if (sortOrder === "asc") {
                return aNum > bNum ? 1 : -1;
            } else {
                return aNum < bNum ? 1 : -1;
            }
        }

        if (sortOrder === "asc") {
            return a > b ? 1 : -1;
        } else {
            return a < b ? 1 : -1;
        }
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
                            childCategorie.key === dataKey &&
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
                                                (groupRange ?? 0) -
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
        setChartData($siteStatus, sortBy, sortOrder);
    });

    function toggleSortBy(type: "alpha" | "value") {
        if (sortBy === type) {
            sortOrder = sortOrder === "asc" ? "desc" : "asc";
        } else {
            sortBy = type;
            sortOrder = "asc";
        }
    }
</script>

<div part="lens-chart-wrapper">
    <div part="lens-chart-header">
        {#if options?.hintText !== undefined}
            <div part="lens-chart-info-button-wrapper">
                <InfoButtonComponent
                    message={options.hintText}
                    alignDialogue="bottom-left"
                />
            </div>
        {/if}
        <h4 part="lens-chart-title">{title}</h4>
        {#if enableSorting}
            <div part="lens-chart-sort-buttons">
                <button
                    part="lens-chart-sort-button"
                    class:active={sortBy === "value"}
                    onclick={() => toggleSortBy("value")}
                    title="Sort by value"
                    aria-label="Sort by value {sortBy === 'value'
                        ? sortOrder === 'asc'
                            ? 'ascending'
                            : 'descending'
                        : ''}"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#e3e3e3"
                        ><path
                            d="M120-240v-80h240v80H120Zm0-200v-80h480v80H120Zm0-200v-80h720v80H120Z"
                        /></svg
                    >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        {#if sortBy === "value"}
                            {#if sortOrder === "asc"}
                                <!-- Arrow up for ascending -->
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <polyline points="5 12 12 5 19 12"></polyline>
                            {:else}
                                <!-- Arrow down for descending -->
                                <line x1="12" y1="19" x2="12" y2="5"></line>
                                <polyline points="19 12 12 19 5 12"></polyline>
                            {/if}
                        {:else}
                            <!-- When inactive, show up arrow (indicates it will sort ascending when clicked) -->
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        {/if}
                    </svg>
                </button>

                <button
                    part="lens-chart-sort-button"
                    class:active={sortBy === "alpha"}
                    onclick={() => toggleSortBy("alpha")}
                    title="Sort alphabetically"
                    aria-label="Sort alphabetically {sortBy === 'alpha'
                        ? sortOrder === 'asc'
                            ? 'ascending'
                            : 'descending'
                        : ''}"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#e3e3e3"
                        ><path
                            d="m80-280 150-400h86l150 400h-82l-34-96H196l-32 96H80Zm140-164h104l-48-150h-6l-50 150Zm328 164v-76l202-252H556v-72h282v76L638-352h202v72H548ZM360-760l120-120 120 120H360ZM480-80 360-200h240L480-80Z"
                        /></svg
                    >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        {#if sortBy === "alpha"}
                            {#if sortOrder === "asc"}
                                <!-- Arrow up for ascending -->
                                <line x1="12" y1="19" x2="12" y2="5"></line>
                                <polyline points="5 12 12 5 19 12"></polyline>
                            {:else}
                                <!-- Arrow down for descending -->
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <polyline points="19 12 12 19 5 12"></polyline>
                            {/if}
                        {:else}
                            <!-- When inactive, show up arrow (indicates it will sort ascending when clicked) -->
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        {/if}
                    </svg>
                </button>
            </div>
        {/if}
    </div>

    {#if noDataAvailable}
        <div part="lens-chart-overlay">
            <p part="lens-chart-no-data-available">No Data Available</p>
        </div>
    {/if}

    <div part="lens-chart-container-min-width-0">
        <canvas
            part="lens-chart-canvas"
            bind:this={canvas}
            id="chart"
            onclick={handleClickOnStratifier}
        ></canvas>
    </div>
    <slot />
</div>

<style>
    [part~="lens-chart-container-min-width-0"] {
        min-width: 0;
    }

    [part~="lens-chart-wrapper"] {
        height: 100%;
        display: grid;
        position: relative;
        background-color: var(--white);
    }

    [part~="lens-chart-header"] {
        display: grid;
        grid-template-columns: 24px 1fr max(60px, 25%);
        padding-bottom: var(--gap-m);
    }

    [part~="lens-chart-title"] {
        grid-column: 1/4;
        grid-row: 1/2;
        text-align: center;
        margin: 0;
        margin-top: 6px;
        width: max(50%, calc(50% - 60px));
        margin-right: max(60px, 25%);
        margin-left: auto;
    }

    [part~="lens-chart-info-button-wrapper"] {
        padding-top: 9px;
        padding-left: var(--gap-xxs);
        justify-self: start;
        grid-column: 1/2;
        grid-row: 1/2;
    }

    [part~="lens-chart-sort-buttons"] {
        grid-column: 3/4;
        grid-row: 1/2;
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        justify-content: end;
        grid-gap: 5px;
    }

    [part~="lens-chart-sort-button"] {
        background: transparent;
        border: none;
        border-radius: var(--border-radius-small);
        padding: 4px 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        color: var(--gray, #666);
    }

    [part~="lens-chart-sort-button"]:hover {
        background-color: var(--light-gray, #f5f5f5);
        border-color: var(--dark-gray, #999);
    }

    [part~="lens-chart-sort-button"].active {
        background-color: var(--primary-color, #007bff);
        border-color: var(--primary-color, #007bff);
        color: white;
    }
    [part~="lens-chart-overlay"] {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    [part~="lens-chart-no-data-available"] {
        font-weight: bold;
        color: var(--gray);
        background-color: var(--white);
        padding: 0.5em;
    }

    [part~="lens-chart-canvas"] {
        width: 100%;
        max-height: 400px;
    }
</style>
