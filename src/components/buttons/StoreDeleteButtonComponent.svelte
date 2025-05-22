<script lang="ts">
    import {
        queryStore,
        removeItemFromQuery,
        removeValueFromQuery,
        queryModified,
    } from "../../stores/query";
    import type { QueryItem } from "../../types/queryData";
    import { createEventDispatcher } from "svelte";
    import { lensOptions } from "../../stores/options";

    const dispatch = createEventDispatcher();
    interface Props {
        itemToDelete: { type: string; index: number; item?: QueryItem };
    }

    let { itemToDelete }: Props = $props();

    const { type, index, item } = itemToDelete;

    /**
     * deletes the given item from the query
     * can be a group, item or value
     */
    const deleteItem = (): void => {
        dispatch("clear-search");

        if (type === "group") {
            queryModified.set(true);
            queryStore.update((query) => {
                query = query.filter((group, i) => i !== index);
                if (query.length === 0) {
                    query = [[]];
                }
                return query;
            });
        }
        if (type === "item") {
            removeItemFromQuery(item!, index);
        }
        if (type === "value") {
            removeValueFromQuery(item!, index);
        }
    };
</script>

<button
    part="query-delete-button query-delete-button-{type}"
    onclick={deleteItem}
>
    {#if $lensOptions?.iconOptions?.deleteUrl}
        <img
            part="delete-button-icon delete-button-icon-{type}"
            src={$lensOptions?.iconOptions?.deleteUrl}
            alt="delete icon"
        />
    {:else}
        &#x2715;
    {/if}
</button>

<style>
    [part~="query-delete-button"] {
        background-color: var(--white);
        color: var(--orange);
        cursor: pointer;
        padding: 0;
        border-radius: 50%;
        box-sizing: content-box;
        height: calc(var(--font-size-xs) + 6px);
        width: calc(var(--font-size-xs) + 6px);
    }

    [part~="query-delete-button"]:hover {
        border: solid 1px var(--orange);
        color: var(--orange);
    }

    [part~="query-delete-button-value"] {
        font-size: var(--font-size-xxs);
        color: var(--white);
        margin: 0 var(--gap-xs) 0 var(--gap-xxs);
        background-color: var(--blue);
        border: var(--white) 1px solid;
        transform: translatey(-1px);
    }

    [part~="query-delete-button-item"] {
        font-size: var(--font-size-xs);
        position: absolute;
        top: -6px;
        right: -10px;
        border: solid 1px var(--white);
    }

    [part~="query-delete-button-group"] {
        font-size: var(--font-size-s);
        height: calc(var(--font-size-s) + 10px);
        width: calc(var(--font-size-s) + 10px);
        background-color: var(--white);
        border: solid 1px var(--white);
    }
</style>
