<svelte:options
    customElement={{
        tag: "lens-query-explain-button",
    }}
/>

<script lang="ts">
    import {
        getHumanReadableQuery,
        getParsedItem,
    } from "../../stores/datarequests";
    import { queryStore } from "../../stores/query";
    import type {
        HumanReadableItem,
        HumanReadableQueryObject,
    } from "../../types/humanReadable";
    import type { QueryItem } from "../../types/queryData";
    import InfoButtonComponent from "./InfoButtonComponent.wc.svelte";

    interface Props {
        noQueryMessage?: string;
        queryItem?: QueryItem | undefined;
        /** Query explain button in the search bar is smaller, white, and has no border */
        inSearchBar: boolean;
    }

    let {
        queryItem = undefined,
        noQueryMessage = "Search for all results",
        inSearchBar = false,
    }: Props = $props();

    let message: HumanReadableItem | undefined = $state();
    let humanreadableQueryObject: HumanReadableQueryObject | undefined =
        $derived.by(() => {
            if ($queryStore.flat().length < 1) return undefined;
            return getHumanReadableQuery({
                getObject: true,
                queryStore: $queryStore,
            });
        });

    if (queryItem !== undefined) {
        message = getParsedItem(queryItem, true, false, true);
    }
</script>

{#if inSearchBar}
    <InfoButtonComponent buttonSize="18px" inSearchBar={true}>
        {#if message?.name !== ""}
            {message?.name}: {message?.values}
        {:else}
            <div part="multi-row-message">
                {message.values}
            </div>
        {/if}
    </InfoButtonComponent>
{:else}
    <div part="lens-query-explain-button">
        <InfoButtonComponent buttonSize="25px" alignDialogue="left">
            {#if humanreadableQueryObject && humanreadableQueryObject?.groups.length > 0}
                <h3 part="lens-query-explain-header">
                    {humanreadableQueryObject.header}
                </h3>
                <ul part="lens-query-explain-groups">
                    {#each humanreadableQueryObject.groups as group (group.groupHeader)}
                        <li part="lens-query-explain-group-item">
                            <strong>{group.groupHeader}</strong>
                            <ul part="lens-query-explain-bottom-level-items">
                                {#each group.groupItems as item, index (item.name + index)}
                                    <li
                                        part="lens-query-explain-bottom-level-item"
                                    >
                                        {item.name}: {item.values}
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

    [part~="multi-row-message"] {
        white-space: pre-wrap;
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
        text-align-last: left;
    }
    [part~="lens-query-explain-group-item"] {
        margin-bottom: var(--gap-xs);
    }

    [part~="lens-query-explain-bottom-level-items"] {
        margin-left: var(--gap-sm);
        list-style: none;
    }

    [part~="lens-query-explain-bottom-level-item"] {
        margin-bottom: var(--gap-xxs);
    }
</style>
