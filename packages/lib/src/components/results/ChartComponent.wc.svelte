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
    import Chart, { Colors } from "chart.js/auto";
    import { onMount } from "svelte";

    export let title: string = "";
    export let hintText: string = "";
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
    export let backgroundHoverColors: string[] = ['#aaaaaa'];

    /**
     * TODO: split options and data into two props
     * data will come from the store
     * options will be set from outside the component
     */
    export let chartData: any = {};

    let canvas!: HTMLCanvasElement;

    /**
     * initialize the chart on mount
     */
    onMount(() => {
        console.log(backgroundColors);
        /**
         * set or overwrite important options
         */
        if (!chartData.options) chartData.options = {};
        if (!chartData.options.plugins) chartData.options.plugins = {};
        if (!chartData.options.plugins.legend)
            chartData.options.plugins.legend = {};

        chartData.options.maintainAspectRatio = false;
        if (chartData.type === "bar" && chartData.data.datasets.length <= 1)
            chartData.options.plugins.legend.display = false;

        chartData.data.datasets.forEach((dataset) => {
            dataset.backgroundColor = backgroundColors;
            dataset.hoverBackgroundColor = backgroundHoverColors;
        });

        new Chart(canvas, chartData);
    });
</script>

<div part="chart-wrapper">
    <h4 part="chart-title">{title}</h4>
    <canvas part="chart-canvas" bind:this={canvas} id="chart" />
    <div part="chart-hint">{hintText}</div>
</div>
