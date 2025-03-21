<script lang="ts">
    import { catalogueTextStore } from "../../stores/texts";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";
    import type { NumericRangeCategory } from "../../types/catalogue";
    import { v4 as uuidv4 } from "uuid";
    import type { QueryItem } from "../../types/queryData";

    interface Props {
        element: NumericRangeCategory;
    }

    let { element }: Props = $props();

    let from: number | null = $state(element.min || null);
    let to: number | null = $state(element.max || null);

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
        if (from === null && to === null) return "invalid";
        if (from === to) return `${from}`;
        if (to === null && from !== null) return `≥ ${from}`;
        if (from === null && to !== null) return `≤ ${to}`;
        if (from !== null && to !== null && from < to)
            return ` ${from} - ${to}`;
        return "invalid";
    };

    /**
     * build the query item each time the values change
     */
    let queryItem: QueryItem = $derived({
        id: uuidv4(),
        key: element.key,
        name: element.name,
        type: element.type,
        values: [
            {
                name: transformName(),
                value: { min: from || 0, max: to || 0 },
                queryBindId: uuidv4(),
            },
        ],
    });
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
                        {(to === null && from === null) ||
                    (to !== null && from !== null && from > to)
                        ? ' formfield-error'
                        : ''}"
                    type="number"
                    bind:value={from}
                    onfocusout={handleInputFrom}
                />
            </label>

            <label
                part="number-input-label number-input-values-label lens-number-input-values-label-to"
            >
                {$catalogueTextStore.numberInput?.labelTo}
                <input
                    part="number-input-formfield number-input-formfield-to
                        {(to === null && from === null) ||
                    (to !== null && from !== null && from > to)
                        ? ' formfield-error'
                        : ''}"
                    type="number"
                    bind:value={to}
                    onfocusout={handleInputTo}
                />
            </label>
        </div>
        <QueryAddButtonComponent {queryItem} />
    </div>
</div>

<style>
</style>
