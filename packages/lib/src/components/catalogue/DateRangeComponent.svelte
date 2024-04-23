<script lang="ts">
    console.log("DateRangeComponentUsingNumberType: before import");

    import { queryStore } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import { catalogueTextStore } from "../../stores/texts";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";
    import { activeNumberInputs } from "../../stores/catalogue";

    export let queryItem: QueryItem;

    console.log("DateRangeComponentUsingNumberType: queryItem: " + queryItem);

    // `queryBindId` is a unique identifier for the query.
    const queryBindId = queryItem.values[0].queryBindId;
    const value = queryItem.values[0].value as { min: number; max: number };

    console.log("DateRangeComponentUsingNumberType: queryBindId: " + queryBindId);
    console.log("DateRangeComponentUsingNumberType: value: " + value);

    /**
     * defines and handles the number inputs
     */
    let from: number | null = value.min;
    let to: number | null = value.max;

    console.log("DateRangeComponentUsingNumberType: from: " + from);
    console.log("DateRangeComponentUsingNumberType: to: " + to);

    /**
     * build the proper name for the query value
     * @returns the "from", "≥ from", "≤ to", "from - to" or "invalid"
     */
    const transformName = (): string => {
        if (from === to) return `${from}`;
        if (!to && from) return `≥ ${from}`;
        if (!from && to) return `≤ ${to}`;
        if (from < to) return ` ${from} - ${to}`;
        return "invalid";
    };

    console.log("DateRangeComponentUsingNumberType: transformName: " + transformName);

    /**
     * update all groups in the query store when from or to changes
     * update values in the activeNumberInputs store
     * @param from
     * @param to
     */

    const updateStores = (from: number, to: number): void => {
        console.log("DateRangeComponentUsingNumberType.updateStores: from: " + from);
        console.log("DateRangeComponentUsingNumberType.updateStores: to: " + to);

        queryStore.update((store: QueryItem[][]): QueryItem[][] => {
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

    console.log("DateRangeComponentUsingNumberType: updateStores: " + updateStores);

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

    console.log("DateRangeComponentUsingNumberType: queryItem: " + queryItem);
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
                        {to && from > to ? ' formfield-error' : ''}"
                    type="date"
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
                    type="date"
                    bind:value={to}
                    min="0"
                />
            </label>
        </div>
        <QueryAddButtonComponent {queryItem} />
    </div>
</div>

<style>
</style>
