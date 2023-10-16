<svelte:options
    customElement={{
        tag: "lens-info-button",
        props: {},
    }}
/>

<script lang="ts">
    import { getHumanReadableQuery } from "../../stores/negotiate";

    export let noQueryMessage: string = "Search for all results";
    export let iconUrl: string | null = null;
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
        {#if iconUrl}
            <img part="info-button-icon" src={iconUrl} alt="info icon" />
        {:else}
            &#9432;
        {/if}
    {#if tooltipOpen}
        <div part="info-button-dialogue">
            {query.length > 0 ? query : noQueryMessage}
        </div>
    {/if}
</button>
