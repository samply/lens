<svelte:options
    customElement={{
        tag: "lens-chart",
        props: {
            chartData: { type: "Object" },
            backgroundColors: { type: "Array" },
            backgroundHoverColors: { type: "Array" },
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

    export let title: string = ""; // e.g. 'Gender Distribution'
    export let catalogueGroupCode: string = ""; // e.g. "gender"

    let responseGroupCode: string
    $: responseGroupCode = $catalogueKeyToResponseKeyMap.get(catalogueGroupCode);


    export let hintText: string = "";
    export let displayLegends: boolean = false;
    export let chartType: keyof ChartTypeRegistry = "pie";

    export let backgroundColors: string[] = [
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
    export let backgroundHoverColors: string[] = ["#aaaaaa"];

    /**
     * initialize the chart
     */
    let canvas!: HTMLCanvasElement;

    let chart: Chart;

    let initialChartData = {
        type: chartType,
        data: {
            labels: ["male"],
            datasets: [
                {
                    label: "",
                    data: [1],
                    backgroundColors: ["#aaa"],
                    backgroundHoverColors: ["#bbb"],
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
     * @param chartLabels
     * @returns an array of chart data sets from the response store
     */
    const getChartDataSets = (
        chartLabels: string[]
    ): { label; data; backgroundColors; backgroundHoverColors }[] => {
                const dataSet: number[] = chartLabels.map((label: string): number => {
            const stratifierCode = label;
            const stratifierCodeCount: number =
                getAggregatedPopulationForStratumCode(
                    $responseStore,
                    stratifierCode
                );
            return stratifierCodeCount;
        });

        return [
            {
                label: "",
                data: dataSet,
                backgroundColors,
                backgroundHoverColors,
            },
        ];
    };

    /**
     * watches the response store and updates the chart data
     */

    const setChartData = (responseStore) => {
        
        if (responseStore.size === 0) return;
        let isDataAvailable = false;
        responseStore.forEach((value, key) => {
            if (value.data !== null) isDataAvailable = true;
        });
        
        if (!isDataAvailable) return;

        
        const chartLabels = getStratifierCodesForGroupCode(
            responseStore,
            responseGroupCode
        );

                chart.data.labels = chartLabels;
        chart.data.datasets = getChartDataSets(chartLabels);
        chart.update();
    };

    $: setChartData($responseStore);

    onMount(() => {
        chart = new Chart(canvas, initialChartData);
    });

    /**
     * adds stratifier as a search parameter when clicked
     * 
     */
    const handleClickOnStratifier = () => {
        /**
         * the clicked stratifier
         */
        const stratifier = chart.getActiveElements()[0];
        if (!stratifier) return;
        const label: string = chart.data.labels[stratifier.index] as string;


        let queryItem: QueryItem

        $catalogue.forEach((parentCategory: Category) => {
            if('childCategories' in parentCategory) {

                parentCategory.childCategories.forEach((childCategorie: Category) => {
                    if(childCategorie.key === catalogueGroupCode && 'criteria' in childCategorie){
                        
                        let values: QueryValue[] = []
                        childCategorie.criteria.forEach((criterion: Criteria) => {

                            if(criterion.key === label) {
                            values[0] = {
                                name: criterion.name,
                                value: criterion.key,
                                queryBindId: uuidv4(),
                                description: criterion.description,
                            }}
                        })

                        queryItem = {
                            id: uuidv4(),
                            key: childCategorie.name,
                            name: childCategorie.name,
                            system: 'system' in childCategorie? childCategorie.system: '',
                            type: 'type' in childCategorie ? childCategorie.type: 'BETWEEN',
                            values: values,
                        }

                        addItemToQuery(queryItem, $activeQueryGroupIndex)
                    }
                });
            }
        })


        addItemToQuery(queryItem, $activeQueryGroupIndex)
        
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
