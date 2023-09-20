<svelte:options
    customElement={{
        tag: "lens-search-bar",
        props: {
            treeData: { type: "Object" },
            noMatchesFoundMessage: { type: "String" },
            chips: { type: "Boolean" },
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
    import type { AutoCompleteItem, QueryItem, QueryValue } from "../../types/queryData";
    import { v4 as uuidv4 } from "uuid";
    import StoreDeleteButtonComponent from "../buttons/StoreDeleteButtonComponent.svelte";
    import { addPercentageSignToCriteria } from "../../helpers/object-formaters";

    /**
     * props
     * @param treeData takes a Category tree to build the autocomplete items from
     * @param noMatchesFoundMessage takes a string to display when no matches are found
     */
    export let treeData: Category[] = [];
    export let noMatchesFoundMessage: string = "No matches found";
    export let placeholderText: string = "Type to filter conditions";
    export let chips: boolean = false;
    export let queryGroup: QueryItem[] = [];
    export let index: number = 0;


    console.log(treeData);


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
            autoCompleteItems = category.criteria.map((criterion: Criteria) => ({
                name: category.name,
                key: category.key,
                type: category.type,
                system: category.system,
                criterion: criterion,
            }));
        return autoCompleteItems;
    };

    /**
     * Build a full list of autocomplete items from a given Category tree
     * @param treeData
     */
    const buildDatalistItems = (treeData: Category[]): AutoCompleteItem[] => {
        let autoCompleteItems: AutoCompleteItem[] = [];
        treeData.forEach((category) => {
            if ("childCategories" in category) {
                autoCompleteItems = [
                    ...autoCompleteItems,
                    ...buildDatalistItems(category.childCategories),
                ];
            } else {
                if ('criteria' in category)
                    addPercentageSignToCriteria(category.criteria);

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
     */
    const criteria: AutoCompleteItem[] = buildDatalistItems(treeData);
   
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
    $: $inputOptions = criteria.filter((item) => {
        const clearedInputValue = inputValue
            .replace(/^[0-9]*:/g, "")
            .toLocaleLowerCase();
        return (
            item.name.toLowerCase().includes(clearedInputValue) ||
            item.criterion.name.toLowerCase().includes(clearedInputValue) ||
            item.criterion.description
                ?.toLowerCase()
                .includes(clearedInputValue)
        );
    });

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
            addInputValueToStore(
                $inputOptions[focusedItemIndex],
                extractTargetGroupFromInputValue()
            );
        }
    };

    /**
     * handles click events to make input options selectable
     * @param inputOption
     */
    const selectItemByClick = (inputOption) => {
        addInputValueToStore(inputOption, extractTargetGroupFromInputValue());
    };



</script>

<div part="lens-searchbar">
    {#if chips}
        <div part="lens-searchbar-chips">
            {#each queryGroup as queryItem}
                <div part="lens-searchbar-chip">
                    <span part="lens-searchbar-chip-name">{queryItem.name}:{' '}</span>
                    {#each queryItem.values as value, i}
                        <span part="lens-searchbar-chip-item">
                            <span>{value.name}</span>
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
                            <span>{i === queryItem.values.length - 1 ? "" : " or "}</span>
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
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <!-- this is handled with the handleKeyDown method -->
                    <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                             which will close the options before the click is finshed -->
                    <li
                        part="lens-searchbar-autocomplete-options-item {i ===
                        focusedItemIndex
                            ? 'lens-searchbar-autocomplete-options-item-focused'
                            : ''}"
                        on:mousedown={() => selectItemByClick(inputOption)}
                    >
                        {inputOption.name} : {inputOption.criterion.name} - {inputOption
                            .criterion.description}
                    </li>
                {/each}
            {:else}
                <li>{noMatchesFoundMessage}</li>
            {/if}
        </ul>
    {/if}
    <StoreDeleteButtonComponent itemToDelete={{ type: "group", index }} />
</div>
