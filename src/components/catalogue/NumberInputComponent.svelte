<script lang="ts">
    import AddButton from "./AddButton.svelte";
    import type { NumericRangeCategory } from "../../types/catalogue";
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { onMount } from "svelte";
    import { translate } from "../../helpers/translations";

    let {
        element,
        inSearchBar = false,
        focus = () => {},
        resetToEmptySearchBar = () => {},
        focusSearchbar = () => {},
    }: {
        element: NumericRangeCategory;
        inSearchBar?: boolean;
        focus?: (elementIndex: number) => void;
        resetToEmptySearchBar?: (focus?: boolean) => void;
        focusSearchbar?: () => void;
    } = $props();

    let fromInput: HTMLInputElement;
    let toInput: HTMLInputElement;
    let from: number | null = $state(null);
    let to: number | null = $state(null);

    onMount(() => {
        if (inSearchBar === false) fromInput.focus();
    });

    $effect(() => {
        validateForm();
    });

    function validateForm(): boolean {
        if (from === null && to === null) {
            fromInput.setCustomValidity(translate("cannot_both_be_empty"));
            return false;
        } else if (from !== null && to !== null && from > to) {
            fromInput.setCustomValidity(translate("min_must_be_less_than_max"));
            return false;
        } else {
            fromInput.setCustomValidity("");
            return true;
        }
    }

    function getMinMax(min: number | null, max: number | null): string {
        if (min !== null && max !== null && min === max) return `${min}`;
        if (min !== null && max !== null) return `${min} - ${max}`;
        if (min === null && max !== null) return `≤ ${max}`;
        if (min !== null && max === null) return `≥ ${min}`;
        return "";
    }

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
                        name: getMinMax(from, to),
                        value: { min: from ?? undefined, max: to ?? undefined },
                        queryBindId: uuidv4(),
                    },
                ],
            },
            $activeQueryGroupIndex,
        );
        resetToEmptySearchBar();
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (inSearchBar === false) return;

        if (event.key === "Escape") {
            focusSearchbar();
        }

        if (!validateForm()) return;

        if (event.key === "Enter") {
            onsubmit(new SubmitEvent("submit"));
        }
    }

    async function handleFormFocusIn(event: FocusEvent) {
        const relatedTargetOutside =
            event.relatedTarget instanceof Node &&
            !form.contains(event.relatedTarget);

        // toInput can not be reached by tab when the focus is outside the form,
        // so this can handle the focus via mouse click instead of using another event listener
        if (event.target === toInput) {
            focus(1);
            return;
        }

        // sets focus to the first element of another input component inside the
        // searchbar for easier reverse tabing between inputs
        if (relatedTargetOutside) {
            focus(0);
        }
    }

    let form: HTMLElement;
</script>

<form
    part="lens-number-input-form"
    {onsubmit}
    bind:this={form}
    onfocusin={handleFormFocusIn}
>
    <div part="lens-number-input-formfield-wrapper">
        <input
            onkeydown={handleKeyDown}
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
            onkeydown={handleKeyDown}
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
    <AddButton {handleKeyDown} {inSearchBar} />
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
        color: var(--font-color);
    }
</style>
