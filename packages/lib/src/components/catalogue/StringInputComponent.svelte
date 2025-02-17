<script lang="ts">
    /**
     * This component is part of the query tree.
     *
     * It allows a user to enter an arbitrary string.
     */
    import type { CategoryLeaf } from "../../types/treeData";
    import { v4 as uuidv4 } from "uuid";
    import { addItemToQuery } from "../../stores/query";
    import type { QueryItem } from "../../types/queryData";

    /**
     * Grayed-out text that initially appears in the field before the user enters a string.
     */
    let placeholderText: string = "Enter filter term";

    export let element: CategoryLeaf;

    /**
     * input element binds to this variable. Used to focus the input element
     */
    let searchBarInput: HTMLInputElement;
    /**
     * watches the input value and updates the input options
     */
    let inputValue: string = "";

    let activeDomElement: HTMLElement;

    /**
     * transforms the inputvalue to a QueryItem, adds it to the query store
     * and resets the input value and the focused item index
     * @param inputItem - the input item to add to the query store
     */
    const addInputValueToStore = (inputItem: string): void => {
        /**
         * transform inputItem to QueryItem
         */
        const queryItem: QueryItem = {
            id: uuidv4(),
            name: element.name,
            key: element.key,
            type: element.type,
            system: "system" in element ? element.system : "",
            values: [
                {
                    value: inputItem,
                    name: inputItem,
                    queryBindId: uuidv4(),
                },
            ],
        };

        inputValue = "";

        addItemToQuery(queryItem, 0);
    };

    /**
     * handles keyboard events to make input options selectable
     * @param event - the keyboard event
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "Enter") {
            event.preventDefault();
            addInputValueToStore(inputValue);
        }
    };

    /**
     * scrolls the active dom element into view when it is out of view
     * @param activeDomElement - the active dom element
     */
    const scrollInsideContainerWhenActiveDomElementIsOutOfView = (
        activeDomElement: HTMLElement,
    ): void => {
        if (!activeDomElement) return;
        const container: HTMLElement = activeDomElement.parentElement!;
        const containerTop: number = container.scrollTop;
        const containerBottom: number = containerTop + container.clientHeight;
        const elementTop: number = activeDomElement.offsetTop;
        const elementBottom: number =
            elementTop + activeDomElement.clientHeight;

        if (elementTop < containerTop) {
            container.scrollTop = elementTop;
        } else if (elementBottom > containerBottom) {
            container.scrollTop = elementBottom - container.clientHeight;
        }
    };

    $: scrollInsideContainerWhenActiveDomElementIsOutOfView(activeDomElement);
</script>

<div part="string-container">
    <div part="string-formfield">
        <input
            part="string-formfield-input"
            type="text"
            bind:this={searchBarInput}
            bind:value={inputValue}
            on:keydown={handleKeyDown}
            placeholder={placeholderText}
        />
    </div>
</div>
