<script lang="ts">
    import type { AutocompleteCategory, Criteria } from "../../types/catalogue";
    import { v4 as uuidv4 } from "uuid";
    import {
        activeQueryGroupIndex,
        addItemToQuery,
        queryStore,
    } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import { onMount } from "svelte";

    /**
     * mockdata to get from texts store
     */
    let placeholderText: string = "Type to filter conditions";
    let noMatchesFoundMessage: string = "No matches found";

    interface Props {
        element: AutocompleteCategory;
    }

    let { element }: Props = $props();

    /**
     * list of criteria
     */
    let criteria: Criteria[] = $state(element.criteria);

    const resolvesubgroup = (criterion: Criteria): Criteria[] => {
        let subgroups: Criteria[] = [];
        if (criterion.visible == undefined && !criterion.visible) {
            subgroups.push(criterion);
        }

        if (criterion.subgroup != undefined) {
            criterion.subgroup.forEach((criterion: Criteria) => {
                subgroups = subgroups.concat(resolvesubgroup(criterion));
            });
        }
        return subgroups;
    };

    onMount(() => {
        let subgroups: Criteria[] = [];
        criteria.forEach((element) => {
            if (element.subgroup != undefined) {
                element.subgroup.forEach((criterion: Criteria) => {
                    subgroups = subgroups.concat(resolvesubgroup(criterion));
                });
            }
        });

        criteria = criteria.concat(subgroups);
    });

    /**
     * input element binds to this variable. Used to focus the input element
     */
    let searchBarInput: HTMLInputElement;
    /**
     * watches the input value and updates the input options
     */
    let inputValue: string = $state("");

    /**
     * handles the focus state of the input element
     * closes options when clicked outside
     */
    let autoCompleteOpen = $state(false);

    const getChosenOptionsFromQueryStore = (
        queryStore: QueryItem[][],
    ): QueryItem[] => {
        return queryStore
            .flat()
            .map((queryItem: QueryItem) => {
                const queryItemValues = queryItem.values.map(
                    (queryValue: QueryValue) => {
                        return {
                            ...queryItem,
                            values: [queryValue],
                        };
                    },
                );
                return queryItemValues;
            })
            .flat();
    };

    /**
     * keeps track of the focused item
     */
    let focusedItemIndex: number = $state(-1);

    let activeDomElement: HTMLElement | undefined = $state();

    /**
     * transforms the inputvalue to a QueryItem, adds it to the query store
     * and resets the input value and the focused item index
     * @param inputItem - the input item to add to the query store
     * @param indexOfChosenStore - the index of the chosen store to add the input item to
     */
    const addInputValueToStore = (
        inputItem: Criteria,
        indexOfChosenStore: number,
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
            type: element.type,
            system: element.system,
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
                $activeQueryGroupIndex,
            );
        }
    };

    /**
     * adds the input option to the query store
     * @param inputOption - the input option to add to the query store
     */
    const selectItemByClick = (inputOption: Criteria): void => {
        addInputValueToStore(inputOption, $activeQueryGroupIndex);
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

    /**
     * stores the filtered list of autocomplete items
     */
    let inputOptions: Criteria[] = $derived.by(() => {
        return criteria.filter((item: Criteria) => {
            const clearedInputValue = inputValue
                .replace(/^[0-9]*:/g, "")
                .toLocaleLowerCase();

            return (
                item.name.toLowerCase().includes(clearedInputValue) ||
                item.key.toLowerCase().includes(clearedInputValue) ||
                item.description?.toLowerCase().includes(clearedInputValue)
                /**
                 * FIX ME:
                 * should only take names. This needs a catalogue fix
                 */
                // item.key.toLocaleLowerCase().includes(clearedInputValue) ||
                // item.criterion.key.toLowerCase().includes(clearedInputValue) ||
            );
        });
    });

    /**
     * list of options that allready have been chosen and should be displayed beneath the autocomplete input
     * chosenOptions are constructed from the query store and has no duplicates
     * if an option is put into the store from anywhere it will update
     */
    let chosenOptions = $derived(
        getChosenOptionsFromQueryStore($queryStore).reduce(
            (acc: QueryItem[], queryItem: QueryItem) => {
                const optionAllreadyPresent = acc.find((option: QueryItem) => {
                    return option.values[0].value === queryItem.values[0].value;
                });
                if (optionAllreadyPresent || queryItem.key !== element.key) {
                    return acc;
                }
                return [...acc, queryItem];
            },
            [],
        ),
    );

    $effect(() => {
        if (activeDomElement) {
            scrollInsideContainerWhenActiveDomElementIsOutOfView(
                activeDomElement,
            );
        }
    });
</script>

<div part="autocomplete-container">
    <div part="autocomplete-formfield">
        <input
            part="autocomplete-formfield-input"
            type="text"
            bind:this={searchBarInput}
            bind:value={inputValue}
            onkeydown={handleKeyDown}
            placeholder={placeholderText}
            onfocusin={() => {
                autoCompleteOpen = true;
            }}
            onfocusout={() => {
                autoCompleteOpen = false;
            }}
        />
        {#if autoCompleteOpen && inputValue.length > 0}
            <ul part="autocomplete-options">
                {#if inputOptions?.length > 0}
                    <!-- eslint-disable-next-line svelte/require-each-key -->
                    {#each inputOptions as inputOption, index}
                        {#if index === focusedItemIndex}
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                                which will close the options before the click is finshed -->
                            <li
                                bind:this={activeDomElement}
                                part="autocomplete-options-item autocomplete-options-item-focused"
                                onmousedown={() =>
                                    selectItemByClick(inputOption)}
                            >
                                <div part="autocomplete-options-item-name">
                                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                    {@html getBoldedText(inputOption.name)}
                                </div>
                                <div
                                    part="autocomplete-options-item-description-focused"
                                >
                                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                    {@html getBoldedText(
                                        inputOption.description || "",
                                    )}
                                </div>
                            </li>
                        {:else}
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                                which will close the options before the click is finshed -->
                            <li
                                part="autocomplete-options-item"
                                onmousedown={() =>
                                    selectItemByClick(inputOption)}
                            >
                                <div part="autocomplete-options-item-name">
                                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                    {@html getBoldedText(inputOption.name)}
                                </div>
                                <div
                                    part="autocomplete-options-item-description"
                                >
                                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                    {@html getBoldedText(
                                        inputOption.description || "",
                                    )}
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
</div>

<style>
    [part~="autocomplete-formfield"] {
        margin-bottom: var(--gap-xs);
        margin-top: var(--gap-xs);
        position: relative;
    }

    /* Input field styled to match the date input */
    [part~="autocomplete-formfield-input"] {
        box-sizing: border-box;
        border: 1px solid var(--gray);
        border-radius: var(--gap-xs);
        outline: none;
        padding: var(--gap-xxs) var(--gap-xs);
        font-size: var(--font-size-s);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        width: 100%;
    }

    /* Focus state */
    [part~="autocomplete-formfield-input"]:focus {
        border-color: var(--blue);
    }
    [part~="autocomplete-options"] {
        box-sizing: border-box;
        z-index: 1;
        list-style-type: none;
        padding: 0;
        margin: 0;
        width: 100%;
        position: absolute;
        background-color: white;
        color: black;

        /* Match the border with input field, and blend it */
        border: 1px solid var(--gray);
        border-radius: var(--gap-xs);
        /* Shadow to match input and give depth */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        max-height: 400px;
        overflow-y: auto;
    }

    [part~="autocomplete-options-item"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xs);
        cursor: pointer;
        padding: var(--gap-xxs) var(--gap-xs); /* Match input field’s padding */
        font-size: var(--font-size-s);
        transition: background-color 0.2s ease;
    }

    /* Highlighted option */
    [part~="autocomplete-options-item-focused"] {
        color: var(--white);
        background-color: var(--blue);
    }

    /* Optional: soften background on hover even if not focused */
    [part~="autocomplete-options-item"]:hover:not(
            [part~="autocomplete-options-item-focused"]
        ) {
        background-color: var(
            --gray-light
        ); /* define or replace with actual light gray var */
    }

    /* Description (secondary text) */
    [part~="autocomplete-options-item-description"] {
        font-size: var(--font-size-xs);
        color: var(--blue);
    }

    /* Description when focused */
    [part~="autocomplete-options-item-description-focused"] {
        font-size: var(--font-size-xs);
        color: var(--white);
    }
</style>
