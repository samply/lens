<script lang="ts">
    import type { Category, Criteria } from "../../types/treeData";
    import { v4 as uuidv4 } from "uuid";
    import { addItemToQuery, queryStore } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import AutoCompleteCriterionComponent from "./AutoCompleteCriterionComponent.svelte";
    import { onMount } from "svelte";
    import { addPercentageSignToCriteria } from "../../helpers/object-formaters";

    /**
     * mockdata to get from texts store
     */
    let placeholderText: string = "Type to filter conditions";
    let noMatchesFoundMessage: string = "No matches found";

    export let element: Category;

    /**
     * list of criteria
     */
    let criteria: Criteria[] = "criteria" in element ? element.criteria : [];

    onMount(() => {
        /**
         * adds .% option to find all subgroups
         */
        criteria = addPercentageSignToCriteria(structuredClone(criteria));
    });

    /**
     * stores the filtered list of autocomplete items
     */
    let inputOptions: Criteria[] = [];

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
    $: inputOptions = criteria.filter((item: Criteria) => {
        const clearedInputValue = inputValue
        .replace(/^[0-9]*:/g, "")
        .toLocaleLowerCase();

        return (
            item.name.toLowerCase().includes(clearedInputValue) ||
            item.key.toLowerCase().includes(clearedInputValue) ||
            item.description
                ?.toLowerCase()
                .includes(clearedInputValue)
            /**
             * FIX ME:
             * should only take names. This needs a catalogue fix
             */
            // item.key.toLocaleLowerCase().includes(clearedInputValue) ||
            // item.criterion.key.toLowerCase().includes(clearedInputValue) ||
        );
    });

    /**
     * list of options that allready have been chosen and should be displayed beneath the autocomplete input
     * chosenOptions are constructed from the query store and has no duplicates
     * if an option is put into the store from anywhere it will update
     */
    $: chosenOptions = getChosenOptionsFromQueryStore($queryStore).reduce(
        (acc: QueryItem[], queryItem: QueryItem) => {
            const optionAllreadyPresent = acc.find((option: QueryItem) => {
                return option.values[0].value === queryItem.values[0].value;
            });
            if (optionAllreadyPresent || queryItem.key !== element.key) {
                return acc;
            }
            return [...acc, queryItem];
        },
        []
    );

    const getChosenOptionsFromQueryStore = (queryStore): QueryItem[] => {
        return queryStore
            .flat()
            .map((queryItem: QueryItem) => {
                const queryItemValues = queryItem.values.map(
                    (queryValue: QueryValue) => {
                        return {
                            ...queryItem,
                            values: [queryValue],
                        };
                    }
                );
                return queryItemValues;
            })
            .flat();
    };

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
            type: "type" in element && element.type,
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
        // chosenOptions = [...chosenOptions, queryItem];
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
            addInputValueToStore(inputOptions[focusedItemIndex]);
        }
    };

    const selectItemByClick = (inputOption) => {
        addInputValueToStore(inputOption);
    };


    /**
     * scrolls the active dom element into view when it is out of view
     * @param activeDomElement
     */
     const scrollInsideContainerWhenActiveDomElementIsOutOfView = (activeDomElement): void => {
        if (!activeDomElement) return;
        const container: HTMLElement = activeDomElement.parentElement;
        const containerTop: number = container.scrollTop;
        const containerBottom: number = containerTop + container.clientHeight;
        const elementTop: number = activeDomElement.offsetTop;
        const elementBottom: number = elementTop + activeDomElement.clientHeight;

        if (elementTop < containerTop) {
            container.scrollTop = elementTop;
        } else if (elementBottom > containerBottom) {
            container.scrollTop = elementBottom - container.clientHeight;
        }
    }

    $: scrollInsideContainerWhenActiveDomElementIsOutOfView(activeDomElement);


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
        const indexOfSubStringEnd: number = indexOfSubStringStart + inputValueLength;
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
                {#if inputOptions?.length > 0}
                    {#each inputOptions as inputOption, index}
                        {#if index === focusedItemIndex}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <!-- this is handled with the handleKeyDown method -->
                            <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                                which will close the options before the click is finshed -->
                            <li
                                bind:this={activeDomElement}
                                part="autocomplete-options-item autocomplete-options-item-focused"
                                on:mousedown={() => selectItemByClick(inputOption)}
                            >
                                <div part="autocomplete-options-item-name">
                                    {@html getBoldedText(inputOption.name)}
                                </div>
                                <div part="autocomplete-options-item-description-focused">
                                    {@html getBoldedText(inputOption.description)}
                                </div>
                            </li>
                            {:else}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                            <!-- this is handled with the handleKeyDown method -->
                            <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                                which will close the options before the click is finshed -->
                            <li
                                part="autocomplete-options-item"
                                on:mousedown={() => selectItemByClick(inputOption)}
                            >
                                <div part="autocomplete-options-item-name">
                                    {@html getBoldedText(inputOption.name)}
                                </div>
                                <div part="autocomplete-options-item-description">
                                    {@html getBoldedText(inputOption.description)}
                                </div>
                            </li>
                            {/if}
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
