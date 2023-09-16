<script lang="ts">
    import {
        queryStore,
        removeItemFromQuery,
        removeValueFromQuery,
    } from "../../stores/query";
    import type { QueryItem } from "../../types/queryData";
    export let itemToDelete: { type: string; index: number; item?: QueryItem };

    const { type, index, item } = itemToDelete;

    /**
     * deletes the given item from the query
     * can be a group, item or value
     */
    const deleteItem = () => {
        if (type === "group") {
            queryStore.update((query) => {
                query = query.filter((group, i) => i !== index);
                if (query.length === 0) {
                    query = [[]];
                }
                return query;
            });
        }
        if (type === "item") {
            console.log("delete", itemToDelete);
            removeItemFromQuery(item, index);
        }
        if (type === "value") {
            removeValueFromQuery(item, index);
        }
    };
</script>

<button
    part="query-delete-button query-delete-button-{type}"
    on:click={deleteItem}>&#x2715;</button>
