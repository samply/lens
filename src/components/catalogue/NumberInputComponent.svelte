<script lang="ts">
    import AddButton from "./AddButton.svelte";
    import type { NumericRangeCategory } from "../../types/catalogue";
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { onMount } from "svelte";
    import { translate } from "../../helpers/translations";
    import { getMinMax } from "../../helpers/min-max-string-builder";

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

    $effect(() => {
        if (from === null && to === null) {
            fromInput.setCustomValidity(translate("cannot_both_be_empty"));
        } else if (from !== null && to !== null && from > to) {
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
                        name: getMinMax({
                            min: from as number,
                            max: to as number,
                        }),
                        value: { min: from ?? undefined, max: to ?? undefined },
                        queryBindId: uuidv4(),
                    },
                ],
            },
            $activeQueryGroupIndex,
        );
    }
</script>

<form part="lens-number-input-form" {onsubmit}>
    <div part="lens-number-input-formfield-wrapper">
        <input
            part="lens-number-input-formfield"
            type="number"
            step="any"
            placeholder="min"
            min={element.min}
            max={element.max}
            bind:value={from}
            bind:this={fromInput}
        />
        {#if element.unitText !== undefined}
            <span part="lens-number-input-formfield-unit"
                >{element.unitText}</span
            >
        {/if}
    </div>
    <span part="lens-number-input-range-separator">-</span>
    <div part="lens-number-input-formfield-wrapper">
        <input
            part="lens-number-input-formfield"
            type="number"
            step="any"
            placeholder="max"
            min={element.min}
            max={element.max}
            bind:value={to}
            bind:this={toInput}
        />
        {#if element.unitText !== undefined}
            <span part="lens-number-input-formfield-unit"
                >{element.unitText}</span
            >
        {/if}
    </div>
    <AddButton />
</form>

<style>
    [part~="lens-number-input-form"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xxs);
    }
    [part~="lens-number-input-formfield-wrapper"] {
        display: flex;
        font-size: 10pt;
        border: 1px solid var(--gray);
        border-radius: var(--gap-xs);
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    [part~="lens-number-input-formfield-wrapper"]:focus-within {
        border-color: var(--blue);
    }
    [part~="lens-number-input-formfield"] {
        border: none;
        outline: none;
        padding: var(--gap-xxs) var(--gap-xs);
        width: 50px;
        font-size: var(--font-size-s);
    }
    [part~="lens-number-input-formfield-unit"] {
        display: flex;
        align-items: center;
        border-left: 1px solid var(--gray);
        padding: 0 var(--gap-xs);
        background-color: var(--lightest-gray);
        font-size: var(--font-size-xs);
    }
</style>
