<svelte:options
    customElement={{
        tag: "lens-chart",
        props: {
            chartData: { type: "Object" },
            backgroundColor: { type: "Array" },
            backgroundHoverColor: { type: "Array" },
            perSite: { type: "Boolean" },
        },
    }}
/>

<script lang="ts">
    import Chart, { type ChartTypeRegistry } from "chart.js/auto";
    import { onMount } from "svelte";
    import {
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

    export let title: string = ""; // e.g. 'Gender Distribution'
    export let catalogueGroupCode: string = ""; // e.g. "gender"
    export let clickToAddState: boolean = false;
    let responseGroupCode: string;
    $: responseGroupCode =
        $catalogueKeyToResponseKeyMap.get(catalogueGroupCode);

    export let hintText: string = "";
    export let displayLegends: boolean = false;
    export let chartType: keyof ChartTypeRegistry = "pie";
    export let perSite: boolean = false;

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
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: displayLegends,
                },
            },
        },
    };

    /**
     * searches the catalogue for the criteria names for the given catalogueGroupCode
     * and sets them as chart labels
     * DISCUSSION: needed? if so how do we implement this for bar charts?
     */
    // $: {
    //     if(chartType === 'pie')
    //         initialChartData.data.labels = getCriteriaNamesFromKey($catalogue, catalogueGroupCode);
    // }

    /**
     * @param chartLabels
     * @returns an array of chart data sets from the response store
     */
    const getChartDataSets = (
        responseStore: ResponseStore,
        chartLabels: string[]
    ): { label; data; backgroundColors; backgroundHoverColors }[] => {
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
        } else {
            dataSet = chartLabels.map((label: string): number => {
                const stratifierCode = label;
                const stratifierCodeCount: number =
                    getAggregatedPopulationForStratumCode(
                        responseStore,
                        stratifierCode
                    );
                return stratifierCodeCount;
            });
        }
        return [
            {
                label: "",
                data: dataSet,
                backgroundColor,
                backgroundHoverColor,
            },
        ];
    };

    /**
     * watches the response store and updates the chart data
     */
    const setChartData = (responseStore: ResponseStore) => {
        console.log(responseStore);
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

        chartLabels.sort(customSort);

        chart.data.labels = chartLabels;
        chart.data.datasets = getChartDataSets(responseStore, chartLabels);
        chart.update();
    };

    $: {
        if ($responseStore.size !== 0){
            console.log($responseStore);
            setChartData($responseStore);
        }
    } 
    

    onMount(() => {
        console.log(initialChartData);
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
        // Convert values to numbers for numeric comparison
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        return numA - numB;
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
        console.log(typeof chart.data.labels[stratifier.index]);
        const label: string = chart.data.labels[stratifier.index] as string;
        console.log(stratifier, label); 
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
                            console.log(childCategorie);

                            if (childCategorie.fieldType === "number") {
                                /**
                                 * TODO: add customisation for the step size
                                 */
                                values = [
                                    {
                                        name: `${label} - ${parseInt(label) + 9}`,
                                        value: { min: parseInt(label), max: parseInt(label) + 9},
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
    <canvas
        part="chart-canvas"
        bind:this={canvas}
        id="chart"
        on:click={handleClickOnStratifier}
    />
    <div part="chart-hint">{hintText}</div>
</div>
