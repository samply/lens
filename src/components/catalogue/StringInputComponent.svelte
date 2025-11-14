<script lang="ts">
    /**
     * This component is part of the query tree.
     *
     * It allows a user to enter an arbitrary string.
     */
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import type { StringCategory } from "../../types/catalogue";
    import AddButton from "./AddButton.svelte";
    import { onMount } from "svelte";

    interface Props {
        element: StringCategory;
    }

    let { element }: Props = $props();

    let input: HTMLInputElement;

    onMount(() => {
        input.focus();
    });

    function onsubmit(event: Event) {
        event.preventDefault();
        addItemToQuery(
            {
                id: uuidv4(),
                key: element.key,
                name: element.name,
                type: element.type,
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
    }
</script>

<form part="lens-string-form" {onsubmit}>
    <input
        part="lens-string-formfield"
        type="text"
        bind:this={input}
        placeholder="Enter filter term"
    />
    <AddButton />
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
