<script lang="ts">
    import type { Category, Criteria } from "../../types/treeData";
    import { writable } from "svelte/store";
    import { v4 as uuidv4 } from "uuid";
    import { addItemToQuery } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import QuerySelectComponent from "./QuerySelectComponent.svelte";
    import { catalogueTextStore } from "../../stores/texts";
    import { queryStore } from "../../stores/query";

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

<div part="lens-catalogue-wrapper lens-catalogue-wrapper-autocomplete">
    <div part="lens-catalogue-section lens-catalogue-section-autocomplete lens-catalogue-section-autocomplete-input">
        <input
            part="lens-catalogue-input lens-catalogue-input-autocomplete"
            type="text"
            bind:this={searchBarInput}
            bind:value={inputValue}
            on:keydown={handleKeyDown}
            placeholder={placeholderText}
        />
        {#if inputValue.length > 0}
            <ul part="lens-catalogue-autocomplete-options">
                {#if $inputOptions?.length > 0}
                    {#each $inputOptions as inputOption, index}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <!-- this is handled with the handleKeyDown method -->
                        <li
                            part="lens-catalogue-autocomplete-options-item {index ===
                                focusedItemIndex && 'focused'}}"
                            on:click={() => selectItemByClick(inputOption)}
                        >
                            {inputOption.name} : {inputOption.description}
                        </li>
                    {/each}
                {:else}
                    <li part="lens-catalogue-autocomplete-options-item lens-catalogue-autocomplete-options-item-no-matches">
                        {noMatchesFoundMessage}
                    </li>
                {/if}
            </ul>
        {/if}
    </div>
    {#each chosenOptions as chosenOption}
        <div part="lens-catalogue-section lens-catalogue-section-autocomplete lens-catalogue-section-autocomplete-chosen-options">
            <span>{chosenOption.values[0].name}</span>
            <span part="lens-catalogqe-section-groups-label lens-catalogue-section-autocomplete-groups-label"
                >{$catalogueTextStore.group}</span
            >
            <span part="lens-catalogue-section-groups-checkboxes lens-catalogue-section-autocomplete-groups-checkboxes">
                {#each $queryStore as _, index}
                    <QuerySelectComponent {index} isChecked={index === 0} queryItem={chosenOption} />
                {/each}
            </span>
        </div>
    {/each}
</div>
