<script lang="ts">
    import type { Category, Criteria } from "../../types/treeData";
    import { writable } from "svelte/store";
    import { v4 as uuidv4 } from "uuid";
    import { addItemToQuery } from "../../stores/query";
    import type { QueryItem } from "../../types/queryData";
    import AutoCompleteCriterionComponent from "./AutoCompleteCriterionComponent.svelte";

    /**
     * mockdata to get from texts store
     */
    let placeholderText: string = "Type to filter conditions";
    let noMatchesFoundMessage: string = "No matches found";

    export let element: Category;

    /**
     * stores the full list of autocomplete items
     */
    const criteria: Criteria[] = element.criteria;

    /**
     * stores the filtered list of autocomplete items
     */
    const inputOptions = writable<Criteria[]>();

    /**
     * input element binds to this variable. Used to focus the input element
     */
    let searchBarInput: HTMLInputElement;
    /**
     * watches the input value and updates the input options
     */
    let inputValue: string = "";

    /**
     * handles the focus state of the input element
     * closes options when clicked outside
     */
    let autoCompleteOpen = false;

    /**
     * watches the input value and updates the input options
     */
    $: $inputOptions = criteria.filter((item) => {
        return (
            item.name.toLowerCase().includes(inputValue) ||
            item.description.toLowerCase().includes(inputValue)
        );
    });

    /**
     * list of options that are allready chosen and should be displayed beneath the input alongside the group checkboxes
     */
    let chosenOptions: QueryItem[] = [];

    /**
     * keeps track of the focused item index
     */
    let focusedItemIndex: number = 0;

    /**
     * transforms the inputvalue to a QueryItem, adds it to the query store
     * and resets the input value and the focused item index
     * @param indexOfChosenStore
     */
    const addInputValueToStore = (
        inputItem: Criteria,
        indexOfChosenStore: number = 0
    ): void => {
        /**
         * check if option is allready present in the query store
         */
        const optionAllreadyPresent = chosenOptions.find((option) => {
            return option.values[0].value === inputItem.key;
        });

        if (optionAllreadyPresent) {
            return;
        }

        /**
         * transform inputItem to QueryItem
         */
        const queryItem: QueryItem = {
            id: uuidv4(),
            name: element.name,
            key: element.key,
            values: [
                {
                    value: inputItem.key,
                    name: inputItem.name,
                    description: inputItem.description,
                    queryBindId: uuidv4(),
                },
            ],
        };

        inputValue = "";
        focusedItemIndex = 0;

        addItemToQuery(queryItem, indexOfChosenStore);
        chosenOptions = [...chosenOptions, queryItem];
    };

    /**
     * handles keyboard events to make input options selectable
     * @param event
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
        if (inputValue.length === 0 || event.key === "Escape") {
            inputValue = "";
            focusedItemIndex = 0;
            return;
        }
        if (event.key === "ArrowDown") {
            event.preventDefault();
            focusedItemIndex = focusedItemIndex + 1;
            if (focusedItemIndex > $inputOptions.length - 1)
                focusedItemIndex = 0;
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            focusedItemIndex = focusedItemIndex - 1;
            if (focusedItemIndex < 0)
                focusedItemIndex = $inputOptions.length - 1;
        }
        if (event.key === "Enter") {
            event.preventDefault();
            addInputValueToStore($inputOptions[focusedItemIndex]);
        }
    };

    const selectItemByClick = (inputOption) => {
        addInputValueToStore(inputOption);
    };
</script>

<div part="autocomplete-container">
    <div part="autocomplete-formfield">
        <input
            part="autocomplete-formfield-input"
            type="text"
            bind:this={searchBarInput}
            bind:value={inputValue}
            on:keydown={handleKeyDown}
            placeholder={placeholderText}
            on:focusin={() => {
                autoCompleteOpen = true;
            }}
            on:focusout={() => {
                autoCompleteOpen = false;
            }}
        />
        {#if autoCompleteOpen && inputValue.length > 0}
            <ul part="autocomplete-options">
                {#if $inputOptions?.length > 0}
                    {#each $inputOptions as inputOption, index}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <!-- this is handled with the handleKeyDown method -->
                        <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                             which will close the options before the click is finshed -->
                        <li
                            part="autocomplete-options-item {index ===
                                focusedItemIndex &&
                                'autocomplete-options-item-focused'}"
                            on:mousedown={() => selectItemByClick(inputOption)}
                        >
                            <span part="autocomplete-options-item-name"
                                >{inputOption.name}</span
                            ><span part="autocomplete-options-item-discription"
                                >{inputOption.description}</span
                            >
                        </li>
                    {/each}
                {:else}
                    <li
                        part="autocomplete-options-item autocomplete-options-item-no-matches"
                    >
                        {noMatchesFoundMessage}
                    </li>
                {/if}
            </ul>
        {/if}
    </div>
    <div part="criterion-wrapper autocomplete-wrapper">
        {#each chosenOptions as chosenOption}
          <AutoCompleteCriterionComponent {chosenOption} />
        {/each}
    </div>
</div>
