<svelte:options
    customElement={{
        tag: "lens-query-explain-button",
    }}
/>

<script lang="ts">
    import {
        getHumanReadableQuery,
        type newHumanReadableQuery,
    } from "../../stores/datarequestscopy";
    import type { QueryItem } from "../../types/queryData";
    import { queryStore } from "../../stores/query";
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

    let message: newHumanReadableQuery = $state({
        header: noQueryMessage,
        groups: [],
    });
    let singleItemMessage: string | undefined;

    if (queryItem === undefined) {
        queryStore.subscribe(() => {
            const readable = getHumanReadableQuery();
            console.log("readable:", readable);
            message = readable;
        });
    } else {
        // const childMessage = buildHumanReadableRecursively(
        //     returnNestedValues(queryItem) as AstElement,
        //     "",
        // );
        // singleItemMessage = childMessage.length > 0 ? childMessage : noQueryMessage;
    }
</script>

{#if inSearchBar}
    <InfoButtonComponent
        message={singleItemMessage}
        buttonSize="18px"
        inSearchBar={true}
    ></InfoButtonComponent>
{:else}
    <div part="lens-query-explain-button">
        <InfoButtonComponent buttonSize="25px" alignDialogue="left">
            {#if message && message?.groups.length > 0}
                <h3 part="lens-query-explain-header">{message.header}</h3>
                <ul part="lens-query-explain-groups">
                    {#each message.groups as group (group.groupHeader)}
                        <li part="lens-query-explain-group-item">
                            <strong>{group.groupHeader}</strong>
                            <ul part="lens-query-explain-bottom-level-items">
                                {#each group.groupItems as item (item)}
                                    <li
                                        part="lens-query-explain-bottom-level-item"
                                    >
                                        {item}
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
