<script lang="ts">
    import AddButton from "./AddButton.svelte";
    import type { DateRangeCategory } from "../../types/catalogue";
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { onMount } from "svelte";
    import { translate } from "../../helpers/translations";

    let {
        element,
    }: {
        element: DateRangeCategory;
    } = $props();

    let fromInput: HTMLInputElement;
    let toInput: HTMLInputElement;
    let from: string = $state("");
    let to: string = $state("");

    onMount(() => {
        fromInput.focus();
    });

    /**
     * Build the string representation of the range.
     */
    function buildName(): string {
        if (from !== "" && to === "") {
            return `≥ ${from}`;
        } else if (from === "" && to !== "") {
            return `≤ ${to}`;
        } else if (from !== "" && to !== "" && from == to) {
            return `${from}`;
        } else {
            return `${from} - ${to}`;
        }
    }

    $effect(() => {
        if (from === "" && to === "") {
            fromInput.setCustomValidity(translate("cannot_both_be_empty"));
        } else if (from !== "" && to !== "" && from > to) {
            fromInput.setCustomValidity(translate("min_must_be_less_than_max"));
        } else {
            fromInput.setCustomValidity("");
        }
    });

    function onsubmit(event: SubmitEvent): void {
        event.preventDefault();
        addItemToQuery(
            {
                id: uuidv4(),
                key: element.key,
                name: element.name,
                type: element.type,
                values: [
                    {
                        name: buildName(),
                        value: { min: from || undefined, max: to || undefined },
                        queryBindId: uuidv4(),
                    },
                ],
            },
            $activeQueryGroupIndex,
        );
    }
</script>

<form part="lens-date-input-form" {onsubmit}>
    <input
        part="lens-date-input-formfield"
        type="date"
        min={element.min}
        max={element.max}
        bind:value={from}
        bind:this={fromInput}
    />
    <span part="date-input-range-separator">-</span>
    <input
        part="lens-date-input-formfield"
        type="date"
        min={element.min}
        max={element.max}
        bind:value={to}
        bind:this={toInput}
    />
    <AddButton />
</form>

<style>
    [part~="lens-date-input-form"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xxs);
    }
    [part~="lens-date-input-formfield"] {
        border: 1px solid var(--gray);
        border-radius: var(--gap-xs);
        outline: none;
        padding: var(--gap-xxs) var(--gap-xs);
        font-size: var(--font-size-xs);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    [part~="lens-date-input-formfield"]:focus {
        border-color: var(--blue);
    }
</style>
