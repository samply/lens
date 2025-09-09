<script lang="ts">
    import {
        queryStore,
        removeItemFromQuery,
        removeValueFromQuery,
        queryModified,
        activeQueryGroupIndex,
    } from "../../stores/query";
    import type { QueryItem } from "../../types/queryData";

    interface Props {
        itemToDelete: {
            type: "item" | "group" | "value";
            index: number;
            item?: QueryItem;
        };
    }

    let { itemToDelete }: Props = $props();

    const { type, index, item } = itemToDelete;

    /**
     * deletes the given item from the query
     * can be a group, item or value
     */
    const deleteItem = (): void => {
        if (type === "group") {
            queryModified.set(true);
            queryStore.update((query) => {
                query = query.filter((group, i) => i !== index);
                if (query.length === 0) {
                    query = [[]];
                }
                if (query.length === 1) {
                    $activeQueryGroupIndex = 0;
                } else if ($activeQueryGroupIndex === index) {
                    $activeQueryGroupIndex = query.length - 1;
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
    part="lens-query-delete-button lens-query-delete-button-{type}"
    onclick={deleteItem}
    aria-label="Delete"
>
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        ><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"
        /></svg
    >
</button>

<style>
    /**
* delete buttons in searchbar and chips
*/

    [part~="lens-query-delete-button"] {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 18px;
        width: 18px;
        color: var(--orange);
        background-color: transparent;
        cursor: pointer;
        padding: 0;
        border-radius: 50%;
        border: 1px solid var(--white);
    }

    [part~="lens-query-delete-button"]:hover {
        border: 1px solid var(--orange);
        color: var(--orange);
    }

    [part~="lens-query-delete-button-value"] {
        color: var(--white);
    }

    [part~="lens-query-delete-button-item"] {
        position: absolute;
        top: -6px;
        right: -10px;
        background-color: var(--white);
    }

    [part~="lens-query-delete-button-group"] {
        height: 24px;
        width: 24px;
    }
</style>
