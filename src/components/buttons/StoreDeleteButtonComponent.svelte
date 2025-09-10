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

                // handles focus and active group after deletion
                if (index < $activeQueryGroupIndex) {
                    $activeQueryGroupIndex -= 1;
                }
                if (
                    index === $activeQueryGroupIndex &&
                    index === query.length
                ) {
                    $activeQueryGroupIndex = query.length - 1;
                }

                const searchBarInputs = document
                    .querySelector(`lens-search-bar-multiple`)
                    ?.shadowRoot?.querySelectorAll(`input`);

                if (searchBarInputs) {
                    searchBarInputs[$activeQueryGroupIndex].focus();
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
    part="
        lens-query-delete-button lens-query-delete-button-{type}"
    onclick={deleteItem}
    aria-label="Delete"
>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 -960 960 960"
        ><path
            d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144z"
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
        border: 1px solid transparent;
    }

    [part~="lens-query-delete-button-value"] {
        color: var(--white);
        border: 1px solid var(--white);
    }

    [part~="lens-query-delete-button-value"]:hover {
        border: 1px solid var(--orange);
        color: var(--orange);
    }

    [part~="lens-query-delete-button-item"] {
        position: absolute;
        top: -6px;
        right: -8px;
        background-color: var(--white);
        border: 1px solid var(--white);
    }

    [part~="lens-query-delete-button-item"]:hover {
        border-color: var(--orange);
    }

    [part~="lens-query-delete-button-group"] {
        height: 22px;
        width: 22px;
    }

    [part~="lens-query-delete-button-group"]:hover {
        border-color: var(--orange);
    }
</style>
