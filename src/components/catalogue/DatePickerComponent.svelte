<script lang="ts">
    import AddButton from "./AddButton.svelte";
    import type { DateRangeCategory } from "../../types/catalogue";
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { onMount } from "svelte";
    import { translate } from "../../helpers/translations";
    import { getMinMax } from "../../helpers/min-max-string-builder";

    let {
        element,
        inSearchBar = false,
        focus,
        resetToEmptySearchBar = () => {},
        focusSearchbar = () => {},
        onFocusOutOfSearchBar = () => {},
    }: {
        element: DateRangeCategory;
        inSearchBar?: boolean;
        focus?: (elementIndex: number) => void;
        resetToEmptySearchBar?: (focus?: boolean) => void;
        focusSearchbar?: () => void;
        onFocusOutOfSearchBar?: (event: FocusEvent) => void;
    } = $props();

    let fromInput: HTMLInputElement;
    let toInput: HTMLInputElement;
    let from: string = $state("");
    let to: string = $state("");

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
                        value: { min: from || undefined, max: to || undefined },
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
        if (!focus) return;

        const relatedTargetOutside =
            event.relatedTarget instanceof Node &&
            !form.contains(event.relatedTarget);

        // toInput can not be reached by tab when the focus is outside the form,
        // so this can handle the focus via mouse click instead of using another event listener
        if (event.target === toInput) {
            focus(1);
            return;
        }

        if (relatedTargetOutside) {
            focus(0);
        }
    }

    function handleFormFocusOut(event: FocusEvent) {
        onFocusOutOfSearchBar(event);
    }

    let form: HTMLElement;
</script>

<form
    part="lens-date-input-form"
    bind:this={form}
    {onsubmit}
    onfocusin={handleFormFocusIn}
    onfocusout={handleFormFocusOut}
>
    <input
        onkeydown={handleKeyDown}
        part="lens-date-input-formfield"
        type="date"
        min={element.min}
        max={element.max}
        bind:value={from}
        bind:this={fromInput}
    />
    <span part="date-input-range-separator">-</span>
    <input
        onkeydown={handleKeyDown}
        part="lens-date-input-formfield"
        type="date"
        min={element.min}
        max={element.max}
        bind:value={to}
        bind:this={toInput}
    />
    <AddButton {handleKeyDown} {inSearchBar} />
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
