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
            <div part="lens-query-explain-aggregated">
                <div part="lens-query-explain-item-name">{queryItemName}</div>
                {#each queryItemValue.value as aggGroup, aggIdx (aggIdx)}
                    {#if aggIdx > 0}
                        <div part="lens-query-explain-agg-and">
                            {translate("query_item_multi_row_header")}
                        </div>
                    {:else}
                        <div part="lens-query-explain-agg-header">
                            {translate("query_item_multi_row_header_top")}
                        </div>
                    {/if}
                    <div part="lens-query-explain-agg-group">
                        {#each aggGroup as aggItem, aggValIdx (aggItem.value + aggValIdx)}
                            {#if aggValIdx > 0}
                                <span part="lens-query-explain-value-or">or</span>
                            {/if}
                            <span part="lens-query-explain-value-pill">
                                {getCategoryFromKey($catalogue, aggItem.value)
                                    ?.name ?? aggItem.value}: {aggItem.name}
                            </span>
                        {/each}
                    </div>
                {/each}
            </div>
        {:else}
            <div part="lens-query-explain-single">
                <span part="lens-query-explain-item-name">{queryItemName}:</span>
                <span part="lens-query-explain-value-pill"
                    >{queryItemValue.name}</span
                >
            </div>
        {/if}
    </InfoButtonComponent>
{:else}
    <div part="lens-query-explain-button">
        <InfoButtonComponent
            buttonSize={25}
            alignDialogue="bottom-left"
            dialogueMaxWidth="350px"
        >
            {#if $queryStore.flat().length > 0}
                {#each $queryStore as group, groupIndex (groupIndex)}
                    {#if groupIndex > 0}
                        <div part="lens-query-explain-or-divider">
                            <hr part="lens-query-explain-or-line" />
                            <span part="lens-query-explain-or-label"
                                >{translate("query_operator_or")}</span
                            >
                            <hr part="lens-query-explain-or-line" />
                        </div>
                    {/if}
                    <div part="lens-query-explain-group">
                        <div part="lens-query-explain-group-header">
                            {translate("query_info_group_header")}
                            {groupIndex + 1}
                        </div>
                        {#each group as item, itemIndex (item.name + itemIndex)}
                            {#if itemIndex > 0}
                                <div part="lens-query-explain-and-connector">
                                    {translate("query_operator_and")}
                                </div>
                            {/if}
                            <div part="lens-query-explain-item">
                                <span part="lens-query-explain-item-name"
                                    >{item.name}</span
                                >
                                <div part="lens-query-explain-values">
                                    {#each item.values as value, valIdx (value.name + valIdx)}
                                        {#if valIdx > 0}
                                            <span
                                                part="lens-query-explain-value-or"
                                                >or</span
                                            >
                                        {/if}
                                        {#if Array.isArray(value.value)}
                                            {#each value.value as aggGroup, aggIdx (aggIdx)}
                                                {#if aggIdx > 0}
                                                    <div
                                                        part="lens-query-explain-agg-and"
                                                    >
                                                        {translate(
                                                            "query_item_multi_row_header",
                                                        )}
                                                    </div>
                                                {/if}
                                                <div
                                                    part="lens-query-explain-agg-group"
                                                >
                                                    {#each aggGroup as aggItem, aggValIdx (aggItem.value + aggValIdx)}
                                                        {#if aggValIdx > 0}
                                                            <span
                                                                part="lens-query-explain-value-or"
                                                                >or</span
                                                            >
                                                        {/if}
                                                        <span
                                                            part="lens-query-explain-value-pill"
                                                        >
                                                            {getCategoryFromKey(
                                                                $catalogue,
                                                                aggItem.value,
                                                            )?.name ??
                                                                aggItem.value}: {aggItem.name}
                                                        </span>
                                                    {/each}
                                                </div>
                                            {/each}
                                        {:else}
                                            <span
                                                part="lens-query-explain-value-pill"
                                                >{value.name}</span
                                            >
                                        {/if}
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/each}
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

    /* ── Full query dialog ── */

    [part~="lens-query-explain-group"] {
        border-left: 3px solid var(--light-blue);
        background-color: var(--lightest-gray);
        border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
        padding: var(--gap-xs);
    }

    [part~="lens-query-explain-group-header"] {
        display: inline-block;
        background: var(--blue);
        color: var(--white);
        border-radius: var(--border-radius-small);
        padding: 1px 8px;
        font-size: var(--font-size-xs);
        font-weight: bold;
        margin-bottom: var(--gap-xxs);
    }

    [part~="lens-query-explain-and-connector"] {
        display: inline-flex;
        border: 1px solid var(--light-blue);
        border-radius: 999px;
        padding: 1px 8px;
        font-size: var(--font-size-xs);
        color: var(--blue);
        font-weight: bold;
        margin: 2px 0;
    }

    [part~="lens-query-explain-or-divider"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xxs);
        margin: var(--gap-xs) 0;
    }

    [part~="lens-query-explain-or-line"] {
        flex: 1;
        border: none;
        border-top: 1px solid var(--gray);
        margin: 0;
    }

    [part~="lens-query-explain-or-label"] {
        background: var(--lightest-gray);
        border: 1px solid var(--gray);
        border-radius: 999px;
        padding: 1px 8px;
        font-size: var(--font-size-xs);
        font-weight: bold;
        color: var(--dark-gray);
        white-space: nowrap;
    }

    [part~="lens-query-explain-item"] {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 4px;
        margin-bottom: var(--gap-xxs);
        text-align: left;
    }

    [part~="lens-query-explain-item-name"] {
        font-weight: bold;
        overflow-wrap: anywhere;
        padding-top: 1px;
    }

    [part~="lens-query-explain-values"] {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
    }

    [part~="lens-query-explain-value-pill"] {
        background: var(--lightest-blue);
        color: var(--dark-blue);
        border: 1px solid var(--lightest-blue);
        border-radius: 999px;
        padding: 1px 8px;
        font-size: var(--font-size-xs);
        overflow-wrap: anywhere;
    }

    [part~="lens-query-explain-value-or"] {
        font-size: var(--font-size-xs);
        color: var(--gray);
        font-style: italic;
    }

    /* ── Aggregated values (AND of ORs) ── */

    [part~="lens-query-explain-agg-header"] {
        font-size: var(--font-size-xs);
        font-weight: bold;
        padding-bottom: 2px;
    }

    [part~="lens-query-explain-agg-and"] {
        font-size: var(--font-size-xs);
        font-weight: bold;
        color: var(--blue);
        padding: 2px 0;
    }

    [part~="lens-query-explain-agg-group"] {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        padding-left: var(--gap-xxs);
    }

    /* ── Single chip dialog ── */

    [part~="lens-query-explain-single"] {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        text-align: left;
        overflow-wrap: anywhere;
    }

    [part~="lens-query-explain-aggregated"] {
        text-align: left;
    }
</style>
