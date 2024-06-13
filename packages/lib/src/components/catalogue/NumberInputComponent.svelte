<script lang="ts">
    import { queryStore } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import { catalogueTextStore } from "../../stores/texts";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";
    import { activeNumberInputs } from "../../stores/catalogue";
    import type { Category } from "../../types/treeData";

    export let queryItem: QueryItem;
    export let element: Category;

    const queryBindId = queryItem.values[0].queryBindId;
    const value = queryItem.values[0].value as { min: number; max: number };

    let from: number | null = value.min;
    let to: number | null = value.max;

    /**
     * handles the "from" input field
     * when the catalogue element has min or max values, they are used on focus out if the input is out of bounds
     */
    const handleInputFrom = (): void => {
        if (from === null) return;

        let min: number | null =
            "min" in element && typeof element.min === "number"
                ? element.min
                : null;
        let max: number | null =
            "max" in element && typeof element.max === "number"
                ? element.max
                : null;

        if (min !== null && from <= min) {
            from = min;
        } else if (max !== null && from >= max) {
            from = max;
        }
    };

    /**
     * handles the "to" input field
     * when the catalogue element has min or max values, they are used on focus out if the input is out of bounds
     */
    const handleInputTo = (): void => {
        if (to === null) return;

        let min: number | null =
            "min" in element && typeof element.min === "number"
                ? element.min
                : null;
        let max: number | null =
            "max" in element && typeof element.max === "number"
                ? element.max
                : null;

        if (min !== null && to <= min) {
            to = min;
        } else if (max !== null && to >= max) {
            to = max;
        }
    };

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

    /**
     * update all groups in the query store when from or to changes
     * update values in the activeNumberInputs store
     * @param from
     * @param to
     */

    const updateStores = (from: number, to: number): void => {
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
                    type="number"
                    bind:value={from}
                    on:focusout={handleInputFrom}
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
                    on:focusout={handleInputTo}
                />
            </label>
        </div>
        <QueryAddButtonComponent {queryItem} />
    </div>
</div>

<style>
</style>
