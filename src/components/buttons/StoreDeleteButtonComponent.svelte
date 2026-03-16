<script lang="ts">
    import {
        queryStore,
        removeItemFromQuery,
        removeValueFromQuery,
        queryModified,
        activeQueryGroupIndex,
    } from "../../stores/query";

    type ItemToDelete =
        | { type: "group"; barIndex: number }
        | {
              type: "item";
              barIndex: number;
              key: string;
              itemType: string;
              negated: boolean;
          }
        | {
              type: "value";
              barIndex: number;
              key: string;
              value: string;
              negated: boolean;
          };

    interface Props {
        itemToDelete: ItemToDelete;
    }

    let { itemToDelete }: Props = $props();

    const deleteItem = (): void => {
        if (itemToDelete.type === "group") {
            const barIndex = itemToDelete.barIndex;
            queryModified.set(true);
            queryStore.update((query) => {
                query.bars = query.bars.filter((_bar, i) => i !== barIndex);
                if (query.bars.length === 0) {
                    query.bars = [{ items: [] }];
                }

                if (barIndex < $activeQueryGroupIndex) {
                    $activeQueryGroupIndex -= 1;
                }
                if (
                    barIndex === $activeQueryGroupIndex &&
                    barIndex === query.bars.length
                ) {
                    $activeQueryGroupIndex = query.bars.length - 1;
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
        if (itemToDelete.type === "item") {
            removeItemFromQuery(
                itemToDelete.key,
                itemToDelete.itemType,
                itemToDelete.negated,
                itemToDelete.barIndex,
            );
        }
        if (itemToDelete.type === "value") {
            removeValueFromQuery(
                itemToDelete.key,
                itemToDelete.value,
                itemToDelete.negated,
                itemToDelete.barIndex,
            );
        }
    };
</script>

<button
    part="
        lens-query-delete-button lens-query-delete-button-{itemToDelete.type}"
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
        top: -5px;
        right: -9px;
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

    /* safari fix. somehow it won't display like the other types */
    [part~="lens-query-delete-button-group"] svg {
        height: 100%;
        width: 100%;
    }

    [part~="lens-query-delete-button-group"]:hover {
        border-color: var(--orange);
    }
</style>
