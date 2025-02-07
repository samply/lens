<script lang="ts">
    import {
        queryStore,
        removeItemFromQuery,
        removeValueFromQuery,
        queryModified,
    } from "../../stores/query";
    import { iconStore } from "../../stores/icons";
    import type { QueryItem } from "../../types/queryData";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    export let itemToDelete: { type: string; index: number; item?: QueryItem };

    $: deleteUrl = $iconStore.get("deleteUrl");

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
    on:click={deleteItem}
>
    {#if deleteUrl}
        <img
            part="delete-button-icon delete-button-icon-{type}"
            src={deleteUrl}
            alt="delete icon"
        />
    {:else}
        &#x2715;
    {/if}
</button>
