<script lang="ts">
    import { queryStore, removeItemFromQuery } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import { catalogueTextStore } from "../../stores/texts";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";
    import { numberInputComponents, removeNumberInputComponent } from "../../stores/catalogue-inputs";
    import { onDestroy } from "svelte";

    export let queryItem: QueryItem;
    const {
        values: [{ queryBindId }],
    } = queryItem;
    console.log(queryBindId);

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
    $: queryItem = {
        ...queryItem,
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
    // const changeQueryStoreWhenFromOrToChanges = (from: number, to: number): void => {
    //     queryStore.update((store) => {
    //         store.forEach((queryGroup: QueryItem[]) => {
    //             queryGroup.forEach((item: QueryItem) => {
    //                 if (item.id !== queryItem.id) {
    //                     return store;
    //                 }
    //                 item.values.forEach((queryValue: QueryValue) => {
    //                     if (queryValue.queryBindId === queryBindId) {
    //                         queryValue.name = `From ${from} to ${to}`;
    //                         queryValue.value = { min: from, max: to };
    //                     }
    //                 });
    //             });
    //         });
    //         return store;
    //     });
    // }
    // $: changeQueryStoreWhenFromOrToChanges(from, to);

    const handleRemoveElement = (): void => {
        $queryStore.forEach((_, index) =>
            removeItemFromQuery(queryItem, index)
        );
        console.log(queryItem);
        removeNumberInputComponent(queryItem);
    };
    
</script>

<div part="criterion-wrapper number-input-wrapper">
    <div part="criterion-item criterion-item-number-input">
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
        <button
            part="number-input-delete-button"
            on:click={handleRemoveElement}
        >
            &minus;
        </button>
        <QueryAddButtonComponent {queryItem} />
    </div>
</div>
