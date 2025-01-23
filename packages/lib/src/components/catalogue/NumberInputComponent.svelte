<script lang="ts">
    import { catalogueTextStore } from "../../stores/texts";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";
    import type { CategoryField } from "../../types/treeData";
    import { v4 as uuidv4 } from "uuid";

    export let element: CategoryField;

    let from: number = (element.min as number) || 0;
    let to: number = (element.max as number) || 0;

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
     * build the query item each time the values change
     */
    $: queryItem = {
        id: uuidv4(),
        key: element.key,
        name: element.name,
        type: element.type,
        values: [
            {
                name: transformName(),
                value: { min: from, max: to },
                queryBindId: uuidv4(),
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
                {$catalogueTextStore.numberInput?.labelFrom}
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
                {$catalogueTextStore.numberInput?.labelTo}
                <input
                    part="number-input-formfield number-input-formfield-to
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
