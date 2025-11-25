<script lang="ts">
    import AddButton from "./AddButton.svelte";
    import type { DateRangeCategory } from "../../types/catalogue";
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { onMount } from "svelte";
    import { translate } from "../../helpers/translations";

    let {
        element,
        inSearchBar = false,
        resetToEmptySearchBar = () => {},
    }: {
        element: DateRangeCategory;
        inSearchBar?: boolean;
        resetToEmptySearchBar?: (focus?: boolean) => void;
    } = $props();

    let form: HTMLFormElement;
    let fromInput: HTMLInputElement;
    let toInput: HTMLInputElement;
    let from: string = $state("");
    let to: string = $state("");

    onMount(() => {
        if (inSearchBar === false) fromInput.focus();
    });

    let formVlaid = $derived(validateForm(from, to));

    function validateForm(from: string, to: string): boolean {
        fromInput.setCustomValidity("");
        if (!from && !to) {
            fromInput.setCustomValidity(translate("cannot_both_be_empty"));
            return false;
        } else if (from && to && from > to) {
            fromInput.setCustomValidity(translate("min_must_be_less_than_max"));
            return false;
        }
        return true;
    }

    function getMinMax(min: string | null, max: string | null): string {
        if (min && max && min === max) return `${min}`;
        if (min && max) return `${min} - ${max}`;
        if (!min && max) return `≤ ${max}`;
        if (min && !max) return `≥ ${min}`;
        return "";
    }

    function addItem(): void {
        if (!formVlaid) {
            fromInput.reportValidity();
            return;
        }

        addItemToQuery(
            {
                id: uuidv4(),
                key: element.key,
                name: element.name,
                type: element.type,
                values: [
                    {
                        name: getMinMax(from, to),
                        value: { min: from || undefined, max: to || undefined },
                        queryBindId: uuidv4(),
                    },
                ],
            },
            $activeQueryGroupIndex,
        );

        resetToEmptySearchBar();
    }

    function onkeydown(event: KeyboardEvent) {
        if (inSearchBar === false) return;

        if (event.key === "Enter") {
            addItem();
        }

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
        }
    }

    function onfocusin(event: FocusEvent) {
        if (!inSearchBar) return;
        // toInput can not be reached by tab when the focus is outside the form,
        // so this can handle the focus via mouse click instead of using another event listener
        if (event.target === toInput) return;

        const relatedTargetOutside =
            event.relatedTarget instanceof Node &&
            !form.contains(event.relatedTarget);

        if (relatedTargetOutside) {
            fromInput.focus();
        }
    }
</script>

<form part="lens-date-input-form" bind:this={form} {onfocusin}>
    <input
        part="lens-date-input-formfield"
        type="date"
        min={element.min}
        max={element.max}
        bind:value={from}
        bind:this={fromInput}
        {onkeydown}
    />
    <span part="date-input-range-separator">-</span>
    <input
        part="lens-date-input-formfield"
        type="date"
        min={element.min}
        max={element.max}
        bind:value={to}
        bind:this={toInput}
        {onkeydown}
    />
    <AddButton onclick={addItem} {onkeydown} {inSearchBar} />
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
