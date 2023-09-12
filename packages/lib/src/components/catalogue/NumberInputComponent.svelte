<script lang="ts">
    import { queryStore } from "../../stores/query";
    import type { Category } from "../../types/treeData";
    import QuerySelectComponent from "./QuerySelectComponent.svelte";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import { catalogueTextStore } from "../../stores/texts";

    export let element: Category;
    export let queryGroupInternalId: string;
    export let handleRemoveElement: (queryItem: QueryItem) => void;
    export let queryBindId: string;

    /**
     * defines and handles the number inputs
     */
    let from: number = 0;
    let to: number = 0;
    /**
     * used to identify the value in the query store which has to update when 'from' or 'to' changes
     */

    /**
     * update all groups in the store when from or to changes
     */
    $: queryStore.update((store) => {
        store.forEach((queryGroup: QueryItem[]) => {
            queryGroup.forEach((item: QueryItem) => {
                if (item.id !== queryGroupInternalId) {
                    return store;
                }
                item.values.forEach((queryValue: QueryValue) => {
                    if (queryValue.queryBindId === queryBindId) {
                        queryValue.name = `From ${from} to ${to}`;
                        queryValue.value = { min: from, max: to };
                    }
                });
            });
        });
        return store;
    });

    /**
     * when some parts of the element change, the values are watched
     * and the QuerySelectComponent is passed thoes new values
     */
    let queryItem: QueryItem;
    $: queryItem = {
        id: queryGroupInternalId,
        key: element.key,
        name: element.name,
        values: [
            {
                name: `From ${from} to ${to}`,
                value: { min: from, max: to },
                queryBindId: queryBindId,
            },
        ],
    };

    /**
     * update all groups in the store when from or to changes
     * @param from
     * @param to
     * @returns void
    */
    const changeQueryStoreWhenFromOrToChanges = (from: number, to: number): void => {
        queryStore.update((store) => {
            store.forEach((queryGroup: QueryItem[]) => {
                queryGroup.forEach((item: QueryItem) => {
                    if (item.id !== queryGroupInternalId) {
                        return store;
                    }
                    item.values.forEach((queryValue: QueryValue) => {
                        if (queryValue.queryBindId === queryBindId) {
                            queryValue.name = `From ${from} to ${to}`;
                            queryValue.value = { min: from, max: to };
                        }
                    });
                });
            });
            return store;
        });
    }
    $: changeQueryStoreWhenFromOrToChanges(from, to);

</script>

<div part="criterion-wrapper number-input-wrapper">
    <div part="criterion-item criterion-item-single-select">
        <div part="criterion-section criterion-section-values">
            <label
                part="number-input-label number-input-values-label lens-number-input-values-label-from"
            >
                {$catalogueTextStore.numberInput.labelFrom}
                <input
                    part="number-input-formfield number-input-formfield-from"
                    type="number"
                    bind:value={from}
                    min="0"
                />
            </label>

            <label
                part="number-input-label number-input-values-label lens-number-input-values-label-to"
            >
                {$catalogueTextStore.numberInput.labelTo}
                <input
                    part="number-input-formfield number-input-formfield-from"
                    type="number"
                    bind:value={to}
                    min="0"
                />
            </label>
        </div>
        <div part="criterion-section criterion-section-groups">
            <span
                part="criterion-group-label criterion-group-label-number-input"
                >{$catalogueTextStore.group}</span
            >
            <span
                part="criterion-group-wrapper criterion-group-wrapper-number-input"
            >
                {#each $queryStore as _, index}
                    <QuerySelectComponent {index} {queryItem} />
                {/each}
            </span>
            <button part="number-input-delete-button" on:click={() => handleRemoveElement(queryItem)}> &minus; </button>
        </div>
    </div>
</div>
