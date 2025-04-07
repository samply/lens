<script lang="ts">
    import type { DateRangeCategory } from "../../types/catalogue";
    import { catalogueTextStore } from "../../stores/texts";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";
    import type { QueryItem } from "../../types/queryData";
    import { v4 as uuidv4 } from "uuid";

    interface Props {
        element: DateRangeCategory;
    }

    let { element }: Props = $props();

    let from: string = $state(element.min || "1900-01-01");
    let to: string = $state(
        element.max || new Date().toISOString().split("T")[0],
    );

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
     * builds the query item each time the values change
     */
    let queryItem: QueryItem = $derived({
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
    });

    /**
     * when the fields loose focus, the values are reset to the starting values
     */
    const handleInputFrom = (): void => {
        if (from === null || from === "" || from === undefined) {
            from =
                (element.min as string) ||
                new Date().toISOString().split("T")[0];
        }
    };

    const handleInputTo = (): void => {
        if (to === null || to === "" || to === undefined) {
            to =
                (element.max as string) ||
                new Date().toISOString().split("T")[0];
        }
    };
</script>

<div part="criterion-wrapper date-input-wrapper">
    <div part="criterion-item">
        <div part="criterion-section criterion-section-values">
            <label
                part="date-input-label date-input-values-label lens-date-input-values-label-from"
            >
                {$catalogueTextStore.numberInput?.labelFrom}
                <input
                    part="date-input-formfield date-input-formfield-from {to &&
                    from > to
                        ? ' formfield-error'
                        : ''}"
                    type="date"
                    bind:value={from}
                    onfocusout={handleInputFrom}
                />
            </label>

            <label
                part="date-input-label date-input-values-label lens-date-input-values-label-to"
            >
                {$catalogueTextStore.numberInput?.labelTo}
                <input
                    part="date-input-formfield date-input-formfield-to{to &&
                    from > to
                        ? ' formfield-error'
                        : ''}"
                    type="date"
                    bind:value={to}
                    onfocusout={handleInputTo}
                />
            </label>
        </div>
        <QueryAddButtonComponent {queryItem} />
    </div>
</div>
