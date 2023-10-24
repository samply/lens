<svelte:options
    customElement={{
        tag: "lens-info-button",
        props: {
            showQuery: {type: "Boolean"},
        },
    }}
/>

<script lang="ts">
    import { iconStore } from "../../stores/icons";
    import { getHumanReadableQuery } from "../../stores/negotiate";
    
    export let message: string[] = [];
    export let noQueryMessage: string = "Search for all results";
    export let showQuery: boolean = false;
    export let infoIconUrl: string | null = null;

    iconStore.update((store) => {
        if (infoIconUrl){
            store.set("info", infoIconUrl);
        }
        return store;
    });

    $: iconUrl = $iconStore.get("info");
    /**
     * handles the toggling of the tooltip
     */
    let tooltipOpen: boolean = false;

    const onFocusOut = () => {
        tooltipOpen = false;
    };

    const displayQueryInfo = () => {
        if(showQuery){
            message = getHumanReadableQuery().length > 0 ? [getHumanReadableQuery()] : [noQueryMessage];
        }
        tooltipOpen = !tooltipOpen;
    };

</script>

<button part="info-button" on:click={displayQueryInfo} on:focusout={onFocusOut}>
        {#if iconUrl}
            <img part="info-button-icon" src={iconUrl} alt="info icon" />
        {:else}
        <span part="info-button-icon">
            &#9432;
        </span>
        {/if}
    {#if tooltipOpen}
        <div part="info-button-dialogue">
            {#each message as msg}
                <div part="info-button-dialogue-message">{msg}</div>
            {/each}
        </div>
    {/if}
</button>
