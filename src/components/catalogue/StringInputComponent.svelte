<script lang="ts">
    /**
     * This component is part of the query tree.
     *
     * It allows a user to enter an arbitrary string.
     */
    import { v4 as uuidv4 } from "uuid";
    import { addItemToQuery } from "../../stores/query";
    import type { QueryItem } from "../../types/queryData";
    import type { StringCategory } from "../../types/catalogue";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";

    /**
     * Grayed-out text that initially appears in the field before the user enters a string.
     */
    let placeholderText: string = "Enter filter term";

    interface Props {
        element: StringCategory;
    }

    let { element }: Props = $props();

    /**
     * input element binds to this variable. Used to focus the input element
     */
    let searchBarInput: HTMLInputElement;
    /**
     * watches the input value and updates the input options
     */
    let inputValue: string = $state("");

    /**
     * transforms the inputvalue to a QueryItem, adds it to the query store
     * and resets the input value and the focused item index
     * @param inputItem - the input item to add to the query store
     */
    const addInputValueToStore = (): void => {
        addItemToQuery(queryItem, 0);
    };

    /**
     * transform inputItem to QueryItem
     */
    const queryItem: QueryItem = $derived({
        id: uuidv4(),
        key: element.key,
        name: element.name,
        type: element.type,
        system: "system" in element ? element.system : "",
        values: [
            {
                name: inputValue,
                value: inputValue,
                queryBindId: uuidv4(),
            },
        ],
    });

    /**
     * handles keyboard events to make input options selectable
     * @param event - the keyboard event
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "Enter") {
            event.preventDefault();
            addInputValueToStore();
        }
    };
</script>

<div part="string-container">
    <div part="string-formfield">
        <input
            part="string-formfield-input"
            type="text"
            bind:this={searchBarInput}
            bind:value={inputValue}
            onkeydown={handleKeyDown}
            placeholder={placeholderText}
        />
        <QueryAddButtonComponent {queryItem} />
    </div>
</div>
