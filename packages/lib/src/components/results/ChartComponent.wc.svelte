<svelte:options customElement={{
    tag: "lens-chart",
    props: {
        chartData: { type: "Object" },
        },
}} />

<script lang="ts">
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";

    export let title: string = "";
    export let hintText: string = "";

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
        new Chart(canvas, chartData);
    });
</script>

<div part="chart-wrapper">
    <h4 part="chart-title">{title}</h4>
        <canvas part="chart-canvas" bind:this={canvas} id="chart" />
    <div part="chart-hint">{hintText}</div>
</div>
