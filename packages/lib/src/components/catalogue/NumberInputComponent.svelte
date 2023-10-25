<script lang="ts">
    import { queryStore, removeValueFromQuery } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import { catalogueTextStore } from "../../stores/texts";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";
    import { activeNumberInputs } from "../../stores/catalogue";

    export let queryItem: QueryItem;

    const queryBindId = queryItem.values[0].queryBindId;
    const value = queryItem.values[0].value as { min: number; max: number };

    /**
     * defines and handles the number inputs
     */
    let from: number | null = value.min;
    let to: number | null = value.max;

    /**
     * build the proper name for the query value
     */
    const transformName = (): string => {
        if (from === to) return `${from}`;
        if(!to && from) return `≥ ${from}`
        if(!from && to) return `≤ ${to}`
        if (from < to) return ` ${from} - ${to}`;
        return "invalid";
    };

    /**
     * update all groups in the query store when from or to changes
     * update values in the activeNumberInputs store
     * @param from
     * @param to
     */

    const updateStores = (from: number, to: number): void => {

        queryStore.update((store: QueryItem [][]): QueryItem[][] => {
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

        activeNumberInputs.update((store: QueryItem[]): QueryItem[] => {
            store.forEach((item: QueryItem) => {
                if (item.key === queryItem.key) {
                    item.values.forEach((queryValue: QueryValue) => {
                        if (queryValue.queryBindId === queryBindId) {
                            queryValue.name = transformName();
                            queryValue.value = { min: from, max: to };
                        }
                    });
                }
            });
            return store;
        });
    };

    $: updateStores(from, to);

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
     * removes the number input from the query store
     * removes the number input from the activeNumberInputs store
     */
    const handleRemoveElement = (): void => {
        $queryStore.forEach((_ : QueryItem[], index: number) =>
            removeValueFromQuery(queryItem, index)
        );
        activeNumberInputs.update((store: QueryItem[]): QueryItem[] => {
            store.forEach((item: QueryItem) => {
                if (item.key === queryItem.key) {
                    item.values = item.values.filter(
                        (queryValue: QueryValue): Boolean =>
                            queryValue.queryBindId !== queryBindId
                    );
                }
            });
            return store;
        });
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
                    part="number-input-formfield number-input-formfield-from
                        {to && from > to ? ' formfield-error': ''}"
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
                    part="number-input-formfield number-input-formfield-from
                        {to && from > to ? ' formfield-error' : ''}"
                    type="number"
                    bind:value={to}
                    min="0"
                />
            </label>
        </div>
        <!-- TODO: maybe needed later when multiple inputs are asked -->
        <!-- <button
            part="number-input-delete-button"
            on:click={handleRemoveElement}
        >
            &minus;
        </button> -->
        <QueryAddButtonComponent {queryItem} />
    </div>
</div>

<style>

</style>