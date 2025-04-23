<script lang="ts">
    import AddButton from "./AddButton.svelte";
    import type { DateRangeCategory } from "../../types/catalogue";
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { onMount } from "svelte";

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
            fromInput.setCustomValidity("Cannot both be empty");
        } else if (from !== "" && to !== "" && from > to) {
            fromInput.setCustomValidity("From must be less than To");
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
                        // Empty string indicates absence of min/max
                        value: { min: from ?? "", max: to ?? "" },
                        queryBindId: uuidv4(),
                    },
                ],
            },
            $activeQueryGroupIndex,
        );
    }
</script>

<form part="number-input-form" {onsubmit}>
    <input
        part="number-input-formfield"
        type="date"
        min={element.min}
        max={element.max}
        bind:value={from}
        bind:this={fromInput}
    />
    <span part="number-input-range-separator">-</span>
    <input
        part="number-input-formfield"
        type="date"
        min={element.min}
        max={element.max}
        bind:value={to}
        bind:this={toInput}
    />
    <AddButton />
</form>

<style>
    [part="number-input-form"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xs);
    }
    [part="number-input-formfield"] {
        border: 1px solid var(--gray);
        border-radius: var(--gap-xs);
        outline: none;
        padding: var(--gap-xxs) var(--gap-xs);
        font-size: var(--font-size-s);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    [part="number-input-formfield"]:focus {
        border-color: var(--blue);
    }
</style>
