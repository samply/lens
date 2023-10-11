<svelte:options
    customElement={{
        tag: "lens-info-button",
        props: {},
    }}
/>

<script lang="ts">
    import { getHumanReadableQuery } from "../../stores/negotiate";

    export let title: string = "i";
    $: query = "";

    /**
     * handles the toggling of the tooltip
     */
    let tooltipOpen: boolean = false;

    const displayQueryInfo = () => {
        query = getHumanReadableQuery();
        tooltipOpen = !tooltipOpen;
    };

    const onFocusOut = () => {
        displayQueryInfo();
        tooltipOpen = false;
    };
</script>

<button part="info-button" on:click={displayQueryInfo} on:focusout={onFocusOut}>
    <div part="info-button-title">
        {title}
    </div>
    {#if tooltipOpen}
        <div part="info-button-dialogue">
            {query.length > 0 ? query : "No query yet. Search for all"}
        </div>
    {/if}
</button>
