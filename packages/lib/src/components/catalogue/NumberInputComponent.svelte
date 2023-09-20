<script lang="ts">
    import { queryStore, removeValueFromQuery } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import { catalogueTextStore } from "../../stores/texts";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";
    import { removeNumberInputComponent } from "../../stores/catalogue-inputs";

    export let queryItem: QueryItem;
    const {
        values: [{ queryBindId }],
    } = queryItem;

    /**
     * defines and handles the number inputs
     */
    let from: number | null = 0;
    let to: number | null = 0;

    /**
     * build the proper name for the query value
     */
    const transformName = (): string => {
        if (from === to) return `${from}`;
        if (from < to && !from) return `≤ ${to}`;
        if (from !== null && to === null) return `≥ ${from}`;
        if (from === null && to !== null) return `≤ ${to}`;
        if (from < to) return ` ${from} - ${to}`;
        return "invalid";
    };

    /**
     * update all groups in the store when from or to changes
     */
    $: queryStore.update((store) => {
        store.forEach((queryGroup: QueryItem[]) => {
            queryGroup.forEach((item: QueryItem) => {
                item.values.forEach((queryValue: QueryValue) => {
                    if (queryValue.queryBindId === queryBindId) {
                        queryValue.name = transformName();
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
                name: transformName(),
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
            removeValueFromQuery(queryItem, index)
        );
        console.log(queryBindId);
        removeNumberInputComponent(queryBindId);
    };
</script>

<div>{JSON.stringify(queryBindId)}</div>
<div part="criterion-wrapper number-input-wrapper">
    <div part="criterion-item criterion-item-number-input">
        <div part="criterion-section criterion-section-values">
            <label
                part="number-input-label number-input-values-label lens-number-input-values-label-from"
            >
                {$catalogueTextStore.numberInput.labelFrom}
                <input
                    part="number-input-formfield number-input-formfield-from{from >
                        to &&
                        to !== null &&
                        ' formfield-error'}"
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
                    part="number-input-formfield number-input-formfield-from{from >
                        to &&
                        to !== null &&
                        ' formfield-error'}"
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
        <!-- <QueryAddButtonComponent queryItem={{
            ...queryItem,
            values: [
                {
                    name: `From ${from} to ${to}`,
                    value: { min: from, max: to },
                    queryBindId: queryBindId,
                },
            ],
        }} /> -->
        <QueryAddButtonComponent {queryItem} />
    </div>
</div>
