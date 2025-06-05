<svelte:options
    customElement={{
        tag: "lens-search-bar",
    }}
/>

<script lang="ts">
    import type {
        AggregatedValue,
        Category,
        Criteria,
    } from "../../types/catalogue";
    import {
        addItemToQuery,
        queryStore,
        activeQueryGroupIndex,
    } from "../../stores/query";
    import type { AutoCompleteItem, QueryItem } from "../../types/queryData";
    import { v4 as uuidv4 } from "uuid";
    import StoreDeleteButtonComponent from "../buttons/StoreDeleteButtonComponent.svelte";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import { catalogue } from "../../stores/catalogue";
    import { facetCounts } from "../../stores/facetCounts";

    interface Props {
        /** The string to display when no matches are found */
        noMatchesFoundMessage?: string;
        typeMoreMessage?: string;
        placeholderText?: string;
        index?: number;
    }

    let {
        noMatchesFoundMessage = "No matches found",
        typeMoreMessage = "Search will start with 3 inserted letters",
        placeholderText = "Type to filter conditions",
        index = 0,
    }: Props = $props();

    let queryGroup = $derived($queryStore[index]);

    /**
     * handles the focus state of the input element
     * closes options when clicked outside
     */
    let autoCompleteOpen = $state(false);

    /**
     * Build a full list of autocomplete items and saves it to 'criteria'
     * @param category - a bottom layer of the category tree
     * @param criterion - the criterion
     * @returns an item that can be used in the autocomplete list
     */
    const buildDatalistItemFromBottomCategoryRec = (
        category: Category,
        criterion: Criteria,
    ): AutoCompleteItem[] => {
        let autoCompleteItems: AutoCompleteItem[] = [];
        if ("criteria" in category) {
            if (criterion.visible == undefined && !criterion.visible) {
                autoCompleteItems.push({
                    name: category.name,
                    key: category.key,
                    type: category.type,
                    system: category.system,
                    criterion: criterion,
                });
            }
            if (criterion.subgroup != undefined) {
                criterion.subgroup.forEach((criterion: Criteria) => {
                    autoCompleteItems = autoCompleteItems.concat(
                        buildDatalistItemFromBottomCategoryRec(
                            category,
                            criterion,
                        ),
                    );
                });
            }
        }
        return autoCompleteItems;
    };

    const buildDatalistItemFromBottomCategory = (
        category: Category,
    ): AutoCompleteItem[] => {
        let autoCompleteItems: AutoCompleteItem[] = [];
        if ("criteria" in category)
            category.criteria.forEach((criterion: Criteria) => {
                if (criterion.visible == undefined && !criterion.visible) {
                    autoCompleteItems.push({
                        name: category.name,
                        key: category.key,
                        type: category.type,
                        system: category.system,
                        criterion: criterion,
                    });
                }
                if (criterion.subgroup != undefined) {
                    criterion.subgroup.forEach((criterion: Criteria) => {
                        autoCompleteItems = autoCompleteItems.concat(
                            buildDatalistItemFromBottomCategoryRec(
                                category,
                                criterion,
                            ),
                        );
                    });
                }
            });
        return autoCompleteItems;
    };

    /**
     * Build a full list of autocomplete items from a given Category tree
     * @param treeData - a category tree
     * @returns an array of items that can be used in the autocomplete list
     */
    const buildDatalistItems = (treeData: Category[]): AutoCompleteItem[] => {
        /**
         * FIX ME:
         *  there seems to be a race condition where the catalogue is not yet loaded and the function is called right away
         *  the data being a string probably comes from the data being passed as a json string
         */
        let autoCompleteItems: AutoCompleteItem[] = [];

        if (typeof treeData === "string") {
            return autoCompleteItems;
        }
        treeData.forEach((category: Category) => {
            if ("childCategories" in category) {
                autoCompleteItems = [
                    ...autoCompleteItems,
                    ...buildDatalistItems(
                        category.childCategories as Category[],
                    ),
                ];
            } else {
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
    let criteria: AutoCompleteItem[] = $derived(
        buildDatalistItems(structuredClone($state.snapshot($catalogue))) || [],
    );

    /**
     * input element binds to this variable. Used to focus the input element
     */
    let searchBarInput: HTMLInputElement;
    /**
     * watches the input value and updates the input options
     */
    let inputValue: string = $state("");

    /**
     * stores the filtered list of autocomplete items
     */
    let inputOptions: AutoCompleteItem[] = $derived.by(() => {
        return criteria.filter((item: AutoCompleteItem) => {
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
    });

    /**
     * keeps track of the focused item
     */
    let focusedItemIndex: number = $state(-1);

    let activeDomElement: HTMLElement | undefined = $state();

    /**
     * transforms the inputvalue to a QueryItem, adds it to the query store
     * and resets the input value and the focused item index
     * @param inputItem - the item to add to the query store
     * @param indexOfChosenStore - the index of the query store to add the item to
     */
    const addInputValueToStore = (
        inputItem: AutoCompleteItem,
        indexOfChosenStore: number = $queryStore.length,
    ): void => {
        /**
         * transform inputItem to QueryItem
         */
        const queryItem: QueryItem = {
            id: uuidv4(),
            name: inputItem.name,
            key: inputItem.key,
            type: "type" in inputItem ? inputItem.type : "",
            system: "system" in inputItem ? inputItem.system : "",
            values: [
                {
                    value:
                        "aggregatedValue" in inputItem.criterion
                            ? (inputItem.criterion
                                  .aggregatedValue as AggregatedValue[][])
                            : inputItem.criterion.key,
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
     * @returns the group index
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
     * @param event - the keyboard event
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
            if (focusedItemIndex > inputOptions.length - 1)
                focusedItemIndex = 0;
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            focusedItemIndex = focusedItemIndex - 1;
            if (focusedItemIndex < 0)
                focusedItemIndex = inputOptions.length - 1;
        }
        if (event.key === "Enter") {
            event.preventDefault();
            addInputValueToStore(
                inputOptions[focusedItemIndex],
                extractTargetGroupFromInputValue(),
            );
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
        const container: HTMLElement =
            activeDomElement.parentElement as HTMLElement;
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

    $effect(() => {
        if (activeDomElement) {
            scrollInsideContainerWhenActiveDomElementIsOutOfView(
                activeDomElement,
            );
        }
    });

    /**
     * handles click events to make input options selectable
     * @param inputOption - the input option to add to the query store
     */
    const selectItemByClick = (inputOption: AutoCompleteItem): void => {
        addInputValueToStore(inputOption, extractTargetGroupFromInputValue());
    };

    /**
     * returns the input option with the matched substring wrapped in <strong> tags
     * @param inputOption - the input option to bold
     * @returns the input option with the matched substring wrapped in <strong> tags
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
            indexOfSubStringEnd,
        );
        const regex: RegExp = new RegExp(subString, "g");

        // Replace each occurrence with the same substring wrapped in <strong> tags
        const resultString: string = inputOption.replace(
            regex,
            `<strong>${subString}</strong>`,
        );
        return resultString;
    };
</script>

<div part="lens-searchbar">
    {#if queryGroup !== undefined && queryGroup.length > 0}
        <div part="lens-searchbar-chips">
            {#each queryGroup as queryItem (queryItem.id)}
                <div part="lens-searchbar-chip">
                    <span part="lens-searchbar-chip-name"
                        >{queryItem.name}:</span
                    >
                    {#each queryItem.values as value (value.queryBindId)}
                        <span part="lens-searchbar-chip-item">
                            <span>{value.name}</span>
                            <span part="lens-searchbar-chip-info-span">
                                &nbsp;
                                <InfoButtonComponent
                                    showQuery={true}
                                    onlyChildInfo={true}
                                    queryItem={{
                                        ...queryItem,
                                        values: [value],
                                    }}
                                />
                            </span>
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
        onkeydown={handleKeyDown}
        placeholder={placeholderText}
        onfocusin={() => {
            autoCompleteOpen = true;
            activeQueryGroupIndex.set(index);
        }}
        onfocusout={() => {
            autoCompleteOpen = false;
            inputValue = "";
        }}
    />
    {#if autoCompleteOpen && inputValue.length > 2}
        <ul part="lens-searchbar-autocomplete-options">
            {#if inputOptions?.length > 0}
                <!-- eslint-disable-next-line svelte/require-each-key -->
                {#each inputOptions as inputOption, i}
                    {#if inputOptions
                        .map((option) => option.name)
                        .indexOf(inputOption.name) === i}
                        <div part="autocomplete-options-heading">
                            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                            {@html getBoldedText(inputOption.name)}
                        </div>
                    {/if}
                    {#if i === focusedItemIndex}
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                             which will close the options before the click is finshed -->
                        <li
                            bind:this={activeDomElement}
                            part="lens-searchbar-autocomplete-options-item lens-searchbar-autocomplete-options-item-focused"
                            onmousedown={() => selectItemByClick(inputOption)}
                        >
                            <div part="autocomplete-options-item-name">
                                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                {@html getBoldedText(
                                    inputOption.criterion.name,
                                )}
                            </div>
                            <div
                                part="autocomplete-options-item-description autocomplete-options-item-description-focused"
                            >
                                {#if inputOption.criterion.description}
                                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                    {@html getBoldedText(
                                        inputOption.criterion.description,
                                    )}
                                {/if}
                            </div>
                            {#if $facetCounts[inputOption.key]?.[inputOption.criterion.key] !== undefined}
                                <div
                                    part="autocomplete-options-item-facet-count"
                                >
                                    {$facetCounts[inputOption.key][
                                        inputOption.criterion.key
                                    ]}
                                </div>
                            {/if}
                        </li>
                    {:else}
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                             which will close the options before the click is finshed -->
                        <li
                            part="lens-searchbar-autocomplete-options-item"
                            onmousedown={() => selectItemByClick(inputOption)}
                        >
                            <div part="autocomplete-options-item-name">
                                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                {@html getBoldedText(
                                    inputOption.criterion.name,
                                )}
                            </div>
                            <div part="autocomplete-options-item-description">
                                {#if inputOption.criterion.description}
                                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                    {@html getBoldedText(
                                        inputOption.criterion.description,
                                    )}
                                {/if}
                            </div>
                            {#if $facetCounts[inputOption.key]?.[inputOption.criterion.key] !== undefined}
                                <div
                                    part="autocomplete-options-item-facet-count"
                                >
                                    {$facetCounts[inputOption.key][
                                        inputOption.criterion.key
                                    ]}
                                </div>
                            {/if}
                        </li>
                    {/if}
                {/each}
            {:else}
                <li>{noMatchesFoundMessage}</li>
            {/if}
        </ul>
    {:else if autoCompleteOpen && inputValue.length > 0 && inputValue.length < 3}
        <ul part="lens-searchbar-autocomplete-options">
            <li>{typeMoreMessage}</li>
        </ul>
    {/if}
    <StoreDeleteButtonComponent
        itemToDelete={{ type: "group", index }}
        on:clear-search={() => {
            inputValue = "";
            focusedItemIndex = -1;
        }}
    />
</div>

<style>
    /**
    * Lens Search Bar
    */

    [part~="lens-searchbar"]:focus-within {
        border-color: var(--blue);
        border: solid 1px var(--blue);
        border-radius: var(--border-radius-small);
        z-index: 2;
    }

    [part~="lens-searchbar"] {
        position: relative;
        z-index: 1;
        align-items: center;
        background-color: var(--white);
        border: solid 1px var(--light-gray);
        border-radius: var(--border-radius-small);
        padding-right: var(--gap-xs);
        padding-left: var(--gap-xs);
        display: flex;
        flex-wrap: wrap;
        width: -webkit-fill-available;
    }

    [part~="lens-searchbar-chips"] {
        display: flex;
        flex-wrap: wrap;
        gap: var(--gap-xs);
        padding-right: var(--gap-xs);
    }

    [part~="lens-searchbar-chip-name"] {
        font-weight: bold;
        padding-right: var(--gap-xs);
    }

    [part~="lens-searchbar-chip"] {
        background-color: var(--blue);
        color: var(--white);
        border-radius: var(--border-radius-small);
        padding: 2px var(--gap-s) 2px var(--gap-xs);
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        position: relative;
    }

    [part~="lens-searchbar-chip-item"] {
        display: inline-flex;
        align-items: center;
    }

    [part~="lens-searchbar-input"] {
        box-sizing: border-box;
        padding: var(--gap-xs) var(--gap-s) var(--gap-xs) var(--gap-xs);
        min-width: 200px;
        flex-grow: 1;
        outline: none;
        border: none;
    }

    /**
    * Lens Search Bar Input Options
    */

    [part~="lens-searchbar-input-options-open"] {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    [part~="lens-searchbar-autocomplete-options"] {
        max-height: 50vh;
        overflow-y: auto;
        list-style-type: none;
        padding: var(--gap-xs);
        margin: 0;
        border: solid 1px var(--blue);
        border-top: none;
        position: absolute;
        top: 30px;
        left: -1px;
        right: -1px;
        background-color: white;
        color: var(--font-color);
        border-bottom-left-radius: var(--border-radius-small);
        border-bottom-right-radius: var(--border-radius-small);
        display: grid;
        grid-template-columns: max-content auto max-content;
    }

    [part~="lens-searchbar-autocomplete-options-item"] {
        display: grid;
        grid-template-columns: subgrid;
        grid-column: 1 / -1; /* Full width */
        cursor: pointer;
        transition: background-color 0.2s ease;
        gap: var(--gap-xs);
        padding: var(--gap-xxs) var(--gap-xs);
    }

    [part~="autocomplete-options-heading"] {
        font-weight: bold;
        grid-column: 1 / -1;
    }

    [part~="lens-searchbar-autocomplete-options-item-focused"] {
        color: var(--white);
        background-color: var(--blue);
    }

    [part~="lens-searchbar-autocomplete-options-item"]:hover:not(
            [part~="autocomplete-options-item-focused"]
        ) {
        background-color: var(--light-gray);
    }

    [part~="autocomplete-options-item-description"] {
        color: var(--blue);
        font-size: var(--font-size-s);
    }
    [part~="autocomplete-options-item-description-focused"] {
        color: var(--white);
    }
    [part~="autocomplete-options-item-facet-count"] {
        color: #636363;
        font-size: 0.95em;
        justify-self: right;
        background-color: rgb(239, 239, 252);
        padding: 1px 6px;
        border-radius: 40px;
    }
</style>
