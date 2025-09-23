<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import type { StringCategory } from "../../types/catalogue";
    import AddButton from "./AddButton.svelte";
    import { onMount } from "svelte";
    import { translate } from "../../helpers/translations";

    let {
        element,
        inSearchBar = false,
        focus = () => {},
        resetToEmptySearchBar = () => {},
        focusSearchbar = () => {},
        onFocusOutOfSearchBar = () => {},
    }: {
        element: StringCategory;
        inSearchBar?: boolean;
        focus?: (elementIndex: number) => void;
        resetToEmptySearchBar?: (focus?: boolean) => void;
        focusSearchbar?: () => void;
        onFocusOutOfSearchBar?: (event: FocusEvent) => void;
    } = $props();

    let input: HTMLInputElement;
    let value: string | null = $state(null);

    onMount(() => {
        if (inSearchBar === false) input.focus();
    });

    function validateForm(): boolean {
        if (!input.value) {
            input.setCustomValidity(translate("cannot_be_empty"));
            return false;
        } else {
            input.setCustomValidity("");
            return true;
        }
    }

    function onsubmit(event: Event) {
        event.preventDefault();
        addItemToQuery(
            {
                id: uuidv4(),
                key: element.key,
                name: element.name,
                type: element.type,
                system: "system" in element ? element.system : "",
                values: [
                    {
                        name: input.value,
                        value: input.value,
                        queryBindId: uuidv4(),
                    },
                ],
            },
            $activeQueryGroupIndex,
        );
        resetToEmptySearchBar();
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (inSearchBar === false || resetToEmptySearchBar === undefined)
            return;

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
    part="lens-string-form"
    {onsubmit}
    bind:this={form}
    onfocusin={handleFormFocusIn}
    onfocusout={handleFormFocusOut}
>
    <input
        onkeydown={handleKeyDown}
        part="lens-string-formfield"
        type="text"
        bind:this={input}
        bind:value
        placeholder="Enter filter term"
    />
    <AddButton {handleKeyDown} {inSearchBar} />
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
