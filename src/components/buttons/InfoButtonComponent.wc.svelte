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
    import { lensOptions } from "../../stores/options";

    interface Props {
        message?: string[] | string;
        noQueryMessage?: string;
        showQuery?: boolean;
        onlyChildInfo?: boolean;
        queryItem?: QueryItem | undefined;
    }

    let {
        message = $bindable([]),
        noQueryMessage = "Search for all results",
        showQuery = false,
        onlyChildInfo = false,
        queryItem = undefined,
    }: Props = $props();

    /**
     * handles the toggling of the tooltip
     */
    let tooltipOpen: boolean = $state(false);

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
    onclick={(e) =>
        onlyChildInfo ? displayQueryInfo(e, queryItem) : displayQueryInfo(e)}
    onfocusout={onFocusOut}
>
    {#if $lensOptions?.iconOptions?.infoUrl}
        <img
            part="info-button-icon"
            src={$lensOptions?.iconOptions?.infoUrl}
            alt="info icon"
        />
    {:else}
        <span part="info-button-icon"> &#9432; </span>
    {/if}
    {#if tooltipOpen}
        <div part="info-button-dialogue" style="user-select: text;">
            <!-- eslint-disable-next-line svelte/require-each-key -->
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
