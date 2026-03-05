<script lang="ts">
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import type { FreeTextElement } from "../../types/catalogue";
    import AddButton from "./AddButton.svelte";
    import { onMount } from "svelte";
    import { translate } from "../../helpers/translations";

    let {
        element,
        inSearchBar = false,
        resetToEmptySearchBar = () => {},
    }: {
        element: FreeTextElement;
        inSearchBar?: boolean;
        resetToEmptySearchBar?: (focus?: boolean) => void;
    } = $props();

    let input: HTMLInputElement;
    let value: string | null = $state(null);

    onMount(() => {
        if (inSearchBar === false) input.focus();
    });

    let formValid = $derived(validateForm(value));

    function validateForm(value: string | null): boolean {
        input.setCustomValidity("");
        if (!value) {
            input.setCustomValidity(translate("cannot_be_empty"));
            return false;
        }
        return true;
    }

    function addItem() {
        if (!formValid) {
            input.reportValidity();
            return;
        }

        addItemToQuery(
            {
                type: "SetItem",
                key: element.key,
                negated: false,
                values: [input.value],
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

    let form: HTMLElement;
</script>

<form part="lens-string-form" bind:this={form}>
    <input
        part="lens-string-formfield"
        type="text"
        bind:this={input}
        bind:value
        placeholder="Enter filter term"
        {onkeydown}
    />
    <AddButton onclick={addItem} {onkeydown} {inSearchBar} />
</form>

<style>
    [part~="lens-string-form"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xs);
    }
    [part~="lens-string-formfield"] {
        border: 1px solid var(--gray);
        border-radius: var(--gap-xs);
        outline: none;
        padding: var(--gap-xxs) var(--gap-xs);
        font-size: var(--font-size-s);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        font-size: var(--font-size-m);
    }
    [part~="lens-string-formfield"]:focus {
        border-color: var(--blue);
    }
</style>
