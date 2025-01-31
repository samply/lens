<svelte:options
    customElement={{
        tag: "lens-info-button",
    }}
/>

<script lang="ts">
    import {
        getHumanReadableQuery,
        buildHumanReadableRecursively,
    } from "../../stores/datarequests";
    import { returnNestedValues } from "../../helpers/ast-transformer";
    import type { AstElement } from "../../types/ast";
    import type { QueryItem } from "../../types/queryData";
    import { iconStore } from "../../stores/icons";

    export let message: string[] | string = [];
    export let noQueryMessage: string = "Search for all results";
    export let showQuery: boolean = false;

    export let onlyChildInfo: boolean = false;
    export let queryItem: QueryItem | undefined = undefined;

    $: iconUrl = $iconStore.get("infoUrl");

    /**
     * handles the toggling of the tooltip
     */
    let tooltipOpen: boolean = false;

    const onFocusOut = (): void => {
        tooltipOpen = false;
    };

    const displayQueryInfo = (e: MouseEvent, queryItem?: QueryItem): void => {
        if (typeof message == "string") {
            message = message.split(",");
        }

        const target: HTMLElement = e.target as HTMLElement;
        if (showQuery) {
            if (onlyChildInfo && queryItem !== undefined) {
                let childMessage = buildHumanReadableRecursively(
                    returnNestedValues(queryItem) as AstElement,
                    "",
                );
                message =
                    childMessage.length > 0 ? [childMessage] : [noQueryMessage];
            } else {
                message =
                    getHumanReadableQuery().length > 0
                        ? [getHumanReadableQuery()]
                        : [noQueryMessage];
            }
        }
        if (
            target.getAttribute("part") !== "info-button-dialogue" &&
            target.getAttribute("part") !== "info-button-dialogue-message"
        ) {
            tooltipOpen = !tooltipOpen;
        }
    };
</script>

<button
    part="info-button"
    on:click={(e) =>
        onlyChildInfo ? displayQueryInfo(e, queryItem) : displayQueryInfo(e)}
    on:focusout={onFocusOut}
>
    {#if iconUrl}
        <img part="info-button-icon" src={iconUrl} alt="info icon" />
    {:else}
        <span part="info-button-icon"> &#9432; </span>
    {/if}
    {#if tooltipOpen}
        <div part="info-button-dialogue" style="user-select: text;">
            {#each message as msg}
                <div
                    part="info-button-dialogue-message"
                    style="user-select: text;"
                >
                    {msg}
                </div>
            {/each}
        </div>
    {/if}
</button>
