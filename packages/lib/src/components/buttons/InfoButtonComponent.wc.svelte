<svelte:options
    customElement={{
        tag: "lens-info-button",
        props: {
            showQuery: { type: "Boolean" },
            onlyChildInfo: { type: "Boolean" },
            queryItem: { type: "Object" },
        },
    }}
/>

<script lang="ts">
    import { getHumanReadableQuery, buildHumanReadableRecursively } from "../../stores/negotiate";
    import { returnNestedValues } from "../../helpers/ast-transformer";
    import type { AstElement } from "../../types/ast";
    import type { QueryItem } from "../../types/queryData";
    import { iconStore } from "../../stores/icons";

    export let message: string[] = [];
    export let noQueryMessage: string = "Search for all results";
    export let showQuery: boolean = false;
    
    export let infoIconUrl: string | null = null;
    export let onlyChildInfo: boolean = false;
    export let queryItem: QueryItem | undefined = undefined;

    iconStore.update((store) => {
        if (infoIconUrl) {
            store.set("info", infoIconUrl);
        }
        return store;
    });

    $: iconUrl = $iconStore.get("info");
    /**
     * handles the toggling of the tooltip
     */
    let tooltipOpen: boolean = false;

    const onFocusOut = (): void => {
        tooltipOpen = false;
    };

    const displayQueryInfo = (queryItem?: QueryItem): void => {
        if (showQuery) {
             if (onlyChildInfo && queryItem !== undefined) {
                let childMessage =
                    buildHumanReadableRecursively(
                    returnNestedValues(queryItem) as AstElement, "");
                message = childMessage.length > 0
                    ? [childMessage] : [noQueryMessage];
                
             } else {
                message =
                    getHumanReadableQuery().length > 0
                        ? [getHumanReadableQuery()]
                        : [noQueryMessage];
            }
        }
        tooltipOpen = !tooltipOpen;
    };
</script>

<button part="info-button" on:click={
                              onlyChildInfo
                                  ? displayQueryInfo(queryItem)
                                  : displayQueryInfo
                                    } on:focusout={onFocusOut}>
    {#if iconUrl}
        <img part="info-button-icon" src={iconUrl} alt="info icon" />
    {:else}
        <span part="info-button-icon"> &#9432; </span>
    {/if}
    {#if tooltipOpen}
        <div part="info-button-dialogue">
          {#each message as msg}
              <div part="info-button-dialogue-message">{msg}</div>
          {/each}
        </div>
    {/if}
</button>
