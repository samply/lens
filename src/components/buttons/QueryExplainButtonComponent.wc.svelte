<svelte:options
    customElement={{
        tag: "lens-query-explain-button",
    }}
/>

<script lang="ts">
    import { translate } from "../../helpers/translations";
    import { elementMap, optionMap } from "../../stores/catalogue";
    import { queryStore } from "../../stores/query";
    import type { QueryItem } from "../../types/query";
    import InfoButtonComponent from "./InfoButtonComponent.wc.svelte";

    interface Props {
        noQueryMessage?: string;
        queryItemName?: string | undefined;
        queryItemValueName?: string | undefined;
    }

    let {
        queryItemName = undefined,
        queryItemValueName = undefined,
        noQueryMessage = "Search for all results",
    }: Props = $props();

    function formatItem(item: QueryItem): string {
        switch (item.type) {
            case "SetItem":
                return item.values
                    .map((v) => $optionMap.get(`${item.key}.${v}`)?.name ?? v)
                    .join(", ");
            case "NumericRangeItem":
                return `${item.min ?? "∞"} – ${item.max ?? "∞"}`;
            case "DateRangeItem":
                return `${item.min ?? "∞"} – ${item.max ?? "∞"}`;
        }
    }
</script>

{#if queryItemName !== undefined && queryItemValueName !== undefined}
    <InfoButtonComponent buttonSize={18} inSearchBar={true}>
        <div part="lens-query-explain-single-row-message">
            {queryItemName}: {queryItemValueName}
        </div>
    </InfoButtonComponent>
{:else}
    <div part="lens-query-explain-button">
        <InfoButtonComponent buttonSize={25} alignDialogue="bottom-left">
            {#if $queryStore.bars.some((b) => b.items.length > 0)}
                <h3 part="lens-query-explain-header">
                    {translate("query_info_header")}
                </h3>
                <ul part="lens-query-explain-groups">
                    {#each $queryStore.bars as bar, barIndex (barIndex)}
                        <li part="lens-query-explain-group-item">
                            <ul part="lens-query-explain-bottom-level-items">
                                <li
                                    part="lens-query-explain-bottom-level-item lens-query-explain-bottom-level-item-header"
                                >
                                    {translate("query_info_group_header")}
                                    {barIndex + 1}
                                </li>
                                {#each bar.items as item (item.key + item.type)}
                                    <li
                                        part="lens-query-explain-bottom-level-item lens-query-explain-bottom-level-item-entry"
                                    >
                                        {$elementMap.get(item.key)?.name ??
                                            item.key}:
                                        {formatItem(item)}
                                    </li>
                                {/each}
                            </ul>
                        </li>
                    {/each}
                </ul>
            {:else}
                {noQueryMessage}
            {/if}
        </InfoButtonComponent>
    </div>
{/if}

<style>
    [part~="lens-query-explain-button"] {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        height: 100%;
        padding: var(--gap-xxs);
        border: solid 1px var(--light-blue);
        border-radius: var(--border-radius-small);
    }

    [part~="lens-query-explain-single-row-message"] {
        text-align: left;
        overflow-wrap: anywhere; /* prefers breaking at spaces, but will break mid-word if needed */
    }

    [part~="lens-query-explain-header"] {
        font-weight: bold;
        margin-bottom: var(--gap-xs);
        margin-top: 0;
        text-align: left;
    }

    [part~="lens-query-explain-groups"] {
        list-style: none;
        padding: 0;
        margin: 0;
        text-align: left;
    }

    [part~="lens-query-explain-group-item"] {
        margin-bottom: var(--gap-xs);
    }

    [part~="lens-query-explain-bottom-level-items"] {
        padding-left: var(--gap-xs);
        list-style: none;
    }

    [part~="lens-query-explain-bottom-level-item"] {
        margin-bottom: var(--gap-xxs);
        overflow-wrap: anywhere; /* prefers breaking at spaces, but will break mid-word if needed */
    }

    [part~="lens-query-explain-bottom-level-item-header"] {
        font-weight: bold;
    }

    [part~="lens-query-explain-bottom-level-item-entry"] {
        padding-left: var(--gap-xs);
    }
</style>
