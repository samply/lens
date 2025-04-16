<script lang="ts">
    import AddToQueryButton from "./AddToQueryButton.svelte";
    import type { NumericRangeCategory } from "../../types/catalogue";
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { onMount } from "svelte";

    let {
        element,
    }: {
        element: NumericRangeCategory;
    } = $props();

    let fromInput: HTMLInputElement;
    let toInput: HTMLInputElement;
    let from: number | null = $state(null);
    let to: number | null = $state(null);

    onMount(() => {
        fromInput.focus();
    });

    /**
     * Build the string representation of the range.
     */
    function buildName(): string {
        if (from !== null && to === null) {
            return `≥ ${from}`;
        } else if (from === null && to !== null) {
            return `≤ ${to}`;
        } else if (from !== null && to !== null && from == to) {
            return `${from}`;
        } else {
            return `${from} - ${to}`;
        }
    }

    $effect(() => {
        if (from === null && to === null) {
            fromInput.setCustomValidity("Cannot both be empty");
        } else if (from !== null && to !== null && from > to) {
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
                        // TODO: 0 indicates absence of min/max, this should be changed so we can use 0 as a value
                        value: { min: from ?? 0, max: to ?? 0 },
                        queryBindId: uuidv4(),
                    },
                ],
            },
            $activeQueryGroupIndex,
        );
    }
</script>

<form part="number-input-form" {onsubmit}>
    <div part="number-input-formfield-wrapper">
        <input
            part="number-input-formfield"
            type="number"
            step="any"
            min={element.min}
            max={element.max}
            bind:value={from}
            bind:this={fromInput}
        />
        <span part="number-input-range-separator">-</span>
        <input
            part="number-input-formfield"
            type="number"
            step="any"
            min={element.min}
            max={element.max}
            bind:value={to}
            bind:this={toInput}
        />
        {#if element.unitText !== undefined}
            <span part="number-input-formfield-unit">{element.unitText}</span>
        {/if}
    </div>
    <AddToQueryButton />
</form>

<style>
    [part="number-input-form"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xs);
    }
    [part="number-input-formfield-wrapper"] {
        display: flex;
        border: 1px solid var(--gray);
        border-radius: var(--gap-xs);
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    [part="number-input-formfield-wrapper"]:focus-within {
        border-color: var(--blue);
    }
    [part="number-input-formfield"] {
        border: none;
        outline: none;
        padding: var(--gap-xxs) var(--gap-xs);
        width: 70px;
        font-size: var(--font-size-m);
    }
    [part="number-input-range-separator"] {
        display: flex;
        align-items: center;
    }
    [part="number-input-formfield-unit"] {
        display: flex;
        align-items: center;
        border-left: 1px solid var(--gray);
        padding: 0 var(--gap-xs);
        background-color: var(--lightest-gray);
    }
</style>
