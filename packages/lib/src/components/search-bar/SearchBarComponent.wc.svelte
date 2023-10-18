<svelte:options
    customElement={{
        tag: "lens-search-bar",
        props: {
            treeData: { type: "Object" },
            noMatchesFoundMessage: { type: "String" },
        },
    }}
/>

<script lang="ts">
    import { writable } from "svelte/store";
    import type { Category, Criteria } from "../../types/treeData";
    import {
        addItemToQuery,
        queryStore,
        activeQueryGroupIndex,
    } from "../../stores/query";
    import type { AutoCompleteItem, QueryItem } from "../../types/queryData";
    import { v4 as uuidv4 } from "uuid";
    import StoreDeleteButtonComponent from "../buttons/StoreDeleteButtonComponent.svelte";
    import { addPercentageSignToCriteria } from "../../helpers/object-formaters";
    import { catalogue } from "../../stores/catalogue";

    /**
     * props
     * @param treeData takes a Category tree to build the autocomplete items from
     * @param noMatchesFoundMessage takes a string to display when no matches are found
     */
    export let treeData: Category[] = [];
    export let noMatchesFoundMessage: string = "No matches found";
    export let placeholderText: string = "Type to filter conditions";
    export let index: number = 0;

    $: queryGroup = $queryStore[index];

    /**
     * Initialize the catalogue store with the given tree data
     * watch for changes from other components
     */
    $: $catalogue = treeData;

    /**
     * handles the focus state of the input element
     * closes options when clicked outside
     */
    let autoCompleteOpen = false;

    /**
     * Build a full list of autocomplete items and saves it to 'criteria'
     * @param category
     */
    const buildDatalistItemFromBottomCategory = (
        category: Category
    ): AutoCompleteItem[] => {
        let autoCompleteItems: AutoCompleteItem[];
        if ("criteria" in category)
            autoCompleteItems = category.criteria.map(
                (criterion: Criteria) => ({
                    name: category.name,
                    key: category.key,
                    type: category.type,
                    system: category.system,
                    criterion: criterion,
                })
            );
        return autoCompleteItems;
    };

    /**
     * Build a full list of autocomplete items from a given Category tree
     * @param treeData
     */
    const buildDatalistItems = (treeData: Category[]): AutoCompleteItem[] => {
        /**
         * FIX ME:
         *  there seems to be a race condition where the catalogue is not yet loaded and the function is called right away
         *  the data being a string probably comes from the data being passed as a json string
         */
        if (typeof treeData === "string") {
            return;
        }
        let autoCompleteItems: AutoCompleteItem[] = [];
        treeData.forEach((category: Category) => {
            if ("childCategories" in category) {
                autoCompleteItems = [
                    ...autoCompleteItems,
                    ...buildDatalistItems(category.childCategories),
                ];
            } else {
                if ("criteria" in category)
                    category.criteria = addPercentageSignToCriteria(
                        category.criteria
                    );

                if (buildDatalistItemFromBottomCategory(category))
                    autoCompleteItems = [
                        ...autoCompleteItems,
                        ...buildDatalistItemFromBottomCategory(category),
                    ];
            }
        });

        return autoCompleteItems;
    };

    /**
     * stores the full list of autocomplete items
     * structuredClone is used to prevent the store from being mutated when the .% is added to the criteria
     */
    let criteria: AutoCompleteItem[];
    $: criteria = buildDatalistItems(structuredClone($catalogue)) || [];

    /**
     * stores the filtered list of autocomplete items
     */
    const inputOptions = writable<AutoCompleteItem[]>();

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
    $: $inputOptions = criteria.filter((item: AutoCompleteItem) => {
        /**
         * lets the user use a number followed by a colon to specify the search group. nice to have for the power users
         */
        const clearedInputValue = inputValue
            .replace(/^[0-9]*:/g, "")
            .toLocaleLowerCase();

        return (
            item.name.toLowerCase().includes(clearedInputValue) ||
            item.criterion.name.toLowerCase().includes(clearedInputValue) ||
            item.criterion.description
                ?.toLowerCase()
                .includes(clearedInputValue)

            /**
             * Discussion:
             * should it also be possible to search for the key?
             */
            // item.key.toLocaleLowerCase().includes(clearedInputValue) ||
            // item.criterion.key.toLowerCase().includes(clearedInputValue) ||
        );
    });

    /**
     * keeps track of the focused item
     */
    let focusedItemIndex: number = -1;

    let activeDomElement: HTMLElement;

    /**
     * transforms the inputvalue to a QueryItem, adds it to the query store
     * and resets the input value and the focused item index
     * @param indexOfChosenStore
     */
    const addInputValueToStore = (
        inputItem: AutoCompleteItem,
        indexOfChosenStore: number = $queryStore.length
    ): void => {
        /**
         * transform inputItem to QueryItem
         */
        const queryItem: QueryItem = {
            id: uuidv4(),
            name: inputItem.name,
            key: inputItem.key,
            type: inputItem.type,
            system: "system" in inputItem && inputItem.system,
            values: [
                {
                    value: inputItem.criterion.key,
                    name: inputItem.criterion.name,
                    description: inputItem.criterion.description,
                    queryBindId: uuidv4(),
                },
            ],
        };

        addItemToQuery(queryItem, indexOfChosenStore);

        inputValue = "";
        focusedItemIndex = 0;
    };

    /**
     * extracts the group index from the input value
     * the user may specify the group index by typing a number followed by a colon
     */
    const extractTargetGroupFromInputValue = (): number => {
        const splitInputValue = inputValue.split(":");
        if (splitInputValue.length > 1) {
            const groupToAddItemTo = +splitInputValue[0] - 1;
            return groupToAddItemTo;
        }
        return index;
    };

    /**
     * handles keyboard events to make input options selectable
     * @param event
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
        if (inputValue.length === 0 || event.key === "Escape") {
            inputValue = "";
            focusedItemIndex = -1;
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
            addInputValueToStore(
                $inputOptions[focusedItemIndex],
                extractTargetGroupFromInputValue()
            );
        }
    };

    /**
     * scrolls the active dom element into view when it is out of view
     * @param activeDomElement
     */
    const scrollInsideContainerWhenActiveDomElementIsOutOfView = (
        activeDomElement
    ): void => {
        if (!activeDomElement) return;
        const container: HTMLElement = activeDomElement.parentElement;
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

    /**
     * handles click events to make input options selectable
     * @param inputOption
     */
    const selectItemByClick = (inputOption) => {
        addInputValueToStore(inputOption, extractTargetGroupFromInputValue());
    };

    /**
     * returns the input option with the matched substring wrapped in <strong> tags
     * @param inputOption
     * @returns string
     */
    const getBoldedText = (inputOption: string): string => {
        // Use a regular expression to find all occurrences of the substring

        const inputValueLength: number = inputValue.length;
        const indexOfSubStringStart: number = inputOption
            .toLocaleLowerCase()
            .indexOf(inputValue.toLocaleLowerCase());
        const indexOfSubStringEnd: number =
            indexOfSubStringStart + inputValueLength;
        const subString: string = inputOption.slice(
            indexOfSubStringStart,
            indexOfSubStringEnd
        );
        const regex: RegExp = new RegExp(subString, "g");

        // Replace each occurrence with the same substring wrapped in <strong> tags
        const resultString: string = inputOption.replace(
            regex,
            `<strong>${subString}</strong>`
        );
        return resultString;
    };
</script>

<div part="lens-searchbar">
    {#if queryGroup.length > 0}
        <div part="lens-searchbar-chips">
            {#each queryGroup as queryItem (queryItem.id)}
                <div part="lens-searchbar-chip">
                    <span part="lens-searchbar-chip-name"
                        >{queryItem.name}:</span
                    >
                    {#each queryItem.values as value, i (value.queryBindId)}
                        <span part="lens-searchbar-chip-item">
                            <span>{value.name}</span>
                            {#if queryItem.values.length > 1}
                                <StoreDeleteButtonComponent
                                    itemToDelete={{
                                        type: "value",
                                        index,
                                        item: {
                                            ...queryItem,
                                            values: [value],
                                        },
                                    }}
                                />
                            {/if}
                        </span>
                    {/each}
                    <StoreDeleteButtonComponent
                        itemToDelete={{ type: "item", index, item: queryItem }}
                    />
                </div>
            {/each}
        </div>
    {/if}
    <input
        part={`lens-searchbar-input ${
            inputValue?.length > 0 ? "lens-searchbar-input-options-open" : ""
        }`}
        type="text"
        bind:this={searchBarInput}
        bind:value={inputValue}
        on:keydown={handleKeyDown}
        placeholder={placeholderText}
        on:focusin={() => {
            autoCompleteOpen = true;
            activeQueryGroupIndex.set(index);
        }}
        on:focusout={() => {
            autoCompleteOpen = false;
        }}
    />
    {#if autoCompleteOpen && inputValue.length > 0}
        <ul part="lens-searchbar-autocomplete-options">
            {#if $inputOptions?.length > 0}
                {#each $inputOptions as inputOption, i}
                    {#if $inputOptions
                        .map((option) => option.name)
                        .indexOf(inputOption.name) === i}
                        <div part="autocomplete-options-item-name">
                            {@html getBoldedText(inputOption.name)}
                        </div>
                    {/if}
                    {#if i === focusedItemIndex}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <!-- this is handled with the handleKeyDown method -->
                        <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                         which will close the options before the click is finshed -->
                        <li
                            bind:this={activeDomElement}
                            part="lens-searchbar-autocomplete-options-item lens-searchbar-autocomplete-options-item-focused"
                            on:mousedown={() => selectItemByClick(inputOption)}
                        >
                            <div part="autocomplete-options-item-name">
                                {@html getBoldedText(
                                    inputOption.criterion.name
                                )}
                            </div>
                            {#if inputOption.criterion.description}
                                <div
                                    part="autocomplete-options-item-description autocomplete-options-item-description-focused"
                                >
                                    {@html getBoldedText(
                                        inputOption.criterion.description
                                    )}
                                </div>
                            {/if}
                        </li>
                    {:else}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <!-- this is handled with the handleKeyDown method -->
                        <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                             which will close the options before the click is finshed -->
                        <li
                            part="lens-searchbar-autocomplete-options-item"
                            on:mousedown={() => selectItemByClick(inputOption)}
                        >
                            <div part="autocomplete-options-item-name">
                                {@html getBoldedText(
                                    inputOption.criterion.name
                                )}
                            </div>
                            {#if inputOption.criterion.description}
                                <div
                                    part="autocomplete-options-item-description"
                                >
                                    {@html getBoldedText(
                                        inputOption.criterion.description
                                    )}
                                </div>
                            {/if}
                        </li>
                    {/if}
                {/each}
            {:else}
                <li>{noMatchesFoundMessage}</li>
            {/if}
        </ul>
    {/if}
    <StoreDeleteButtonComponent itemToDelete={{ type: "group", index }} />
</div>
