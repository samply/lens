<svelte:options
    customElement={{
        tag: "lens-query-explain-button",
    }}
/>

<script lang="ts">
    import { translate } from "../../helpers/translations";
    import { catalogue, getCategoryFromKey } from "../../stores/catalogue";
    import { queryStore } from "../../stores/query";
    import type { QueryValue } from "../../types/queryData";
    import InfoButtonComponent from "./InfoButtonComponent.wc.svelte";

    interface Props {
        noQueryMessage?: string;
        queryItemName?: string | undefined;
        queryItemValue?: QueryValue | undefined;
    }

    let {
        queryItemName = undefined,
        queryItemValue = undefined,
        noQueryMessage = "Search for all results",
    }: Props = $props();
</script>

{#if queryItemName !== undefined && queryItemValue !== undefined}
    <InfoButtonComponent buttonSize={18} inSearchBar={true}>
        {#if Array.isArray(queryItemValue.value)}
            <div part="lens-query-explain-multi-row-message">
                <div
                    part="lens-query-explain-multi-row-message-heading lens-query-explain-multi-row-message-heading-top"
                >
                    {translate("query_item_multi_row_header_top")}
                </div>
                {#each queryItemValue.value as value, index (index)}
                    {#if index > 0}
                        <div
                            part="lens-query-explain-multi-row-message-heading"
                        >
                            {translate("query_item_multi_row_header")}
                        </div>
                    {/if}
                    <div part="lens-query-explain-multi-row-message-group">
                        {#each value as valueItem, i (valueItem.value + i)}
                            <div
                                part="lens-query-explain-multi-row-message-group-item"
                            >
                                {getCategoryFromKey($catalogue, valueItem.value)
                                    ?.name ?? valueItem.value}: {valueItem.name}
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        {:else}
            <div part="lens-query-explain-single-row-message">
                {queryItemName}: {queryItemValue.name}
            </div>
        {/if}
    </InfoButtonComponent>
{:else}
    <div part="lens-query-explain-button">
        <InfoButtonComponent buttonSize={25} alignDialogue={["left"]}>
            {#if $queryStore.flat().length > 0}
                <h3 part="lens-query-explain-header">
                    {translate("query_info_header")}
                </h3>
                <ul part="lens-query-explain-groups">
                    {#each $queryStore as group, index (index)}
                        <li part="lens-query-explain-group-item">
                            <ul part="lens-query-explain-bottom-level-items">
                                <li
                                    part="lens-query-explain-bottom-level-item lens-query-explain-bottom-level-item-header"
                                >
                                    {translate("query_info_group_header")}
                                    {index + 1}
                                </li>
                                {#each group as item, index (item.name + index)}
                                    <li
                                        part="lens-query-explain-bottom-level-item lens-query-explain-bottom-level-item-entry"
                                    >
                                        {item.name}:
                                        {#each item.values as value, index (value.name)}
                                            {index > 0 ? ", " : ""}{value.name}
                                        {/each}
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

    [part~="lens-query-explain-multi-row-message-heading"] {
        font-weight: bold;
        padding-bottom: var(--gap-xxs);
        padding-top: var(--gap-xs);
    }

    [part~="lens-query-explain-multi-row-message-heading-top"] {
        padding-top: 0;
    }

    [part~="lens-query-explain-multi-row-message-group"] {
        padding-left: var(--gap-xs);
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
