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
