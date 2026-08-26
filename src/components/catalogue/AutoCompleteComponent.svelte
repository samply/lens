<script lang="ts">
    import type { AutocompleteCategory, Criteria } from "../../types/catalogue";
    import { v4 as uuidv4 } from "uuid";
    import {
        activeQueryGroupIndex,
        addItemToQuery,
        queryStore,
    } from "../../stores/query";
    import type { QueryItem } from "../../types/queryData";
    import { onMount } from "svelte";
    import { facetCounts } from "../../stores/facetCounts";
    import { lensOptions } from "../../stores/options";
    import { createIncrementalList } from "../../helpers/incrementalList.svelte";

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
        searchBarInput.focus();

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

    /**
     * names of this category's criteria that are already in the active search
     * bar. Those options are grayed out and cannot be added again.
     */
    let selectedNames: Set<string> = $derived(
        new Set(
            ($queryStore[$activeQueryGroupIndex] ?? [])
                .filter((queryItem: QueryItem) => queryItem.key === element.key)
                .flatMap((queryItem: QueryItem) =>
                    queryItem.values.map((queryValue) => queryValue.name),
                ),
        ),
    );

    /**
     * keeps track of the focused item
     */
    /**
     * the first option the user can select, or -1 if every option is already in
     * the active search bar
     * @returns the index of the first selectable option
     */
    const firstSelectableIndex = (): number =>
        inputOptions.findIndex((option) => !selectedNames.has(option.name));

    /**
     * the highlighted option. Typing resets it to the first selectable option so
     * that enter picks the top match, the arrow keys assign to it from there.
     */
    let focusedItemIndex: number = $derived(firstSelectableIndex());

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
         * check if option is allready present in the active search bar
         */
        if (selectedNames.has(inputItem.name)) {
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
        optionList.reset();

        addItemToQuery(queryItem, indexOfChosenStore);
    };

    /**
     * finds the option the arrow keys move the focus to, skipping the options
     * that are already in the active search bar
     * @param step - 1 to move down the list, -1 to move up
     * @returns the index of the next selectable option, or the current index if
     * every other option is already in the search bar
     */
    const nextSelectableIndex = (step: number): number => {
        // wrapping around the end of the list mirrors the plain navigation:
        // downwards to the first option, upwards to the last rendered one. The
        // last option of the full list would have to render everything at once.
        const wrapTo = step > 0 ? 0 : Math.max(optionList.renderedCount - 1, 0);
        let index = focusedItemIndex + step;
        for (let tried = 0; tried < inputOptions.length; tried++) {
            if (index < 0 || index > inputOptions.length - 1) index = wrapTo;
            const option = inputOptions[index];
            if (option !== undefined && !selectedNames.has(option.name)) {
                return index;
            }
            index += step;
        }
        return focusedItemIndex;
    };

    /**
     * handles keyboard events to make input options selectable
     * @param event - the keyboard event
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
        if (inputValue.length === 0 || event.key === "Escape") {
            inputValue = "";
            focusedItemIndex = -1;
            optionList.reset();
            return;
        }
        if (event.key === "ArrowDown") {
            event.preventDefault();
            const nextIndex = nextSelectableIndex(1);
            // navigating past the rendered window renders the next chunk
            optionList.ensureRendered(nextIndex);
            focusedItemIndex = nextIndex;
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            focusedItemIndex = nextSelectableIndex(-1);
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
     * @param event - the mousedown event
     * @param inputOption - the input option to add to the query store
     */
    const selectItemByClick = (
        event: MouseEvent,
        inputOption: Criteria,
    ): void => {
        if (selectedNames.has(inputOption.name)) {
            // the option is already in the active search bar, so the click does
            // nothing. Preventing the default keeps the input focused and the
            // list open.
            event.preventDefault();
            return;
        }
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
        const clearedInputValue = inputValue
            .replace(/^[0-9]*:/g, "")
            .toLocaleLowerCase();

        return criteria
            .map((item: Criteria) => ({
                item,
                rank: matchRank(item, clearedInputValue),
            }))
            .filter(({ rank }) => rank > 0)
            .sort((a, b) => b.rank - a.rank)
            .map(({ item }) => item);
    });

    /**
     * ranks how well a criterion matches the user's input. Items that match by
     * name come before items that only match by description, e.g. typing "BRCA"
     * lists BRCA1 before ABRAXAS1, whose description happens to mention BRCA1.
     * @param item - the criterion to rank
     * @param inputValue - the lowercased input value
     * @returns 2 for a match in the name or key, 1 for a match in the
     * description, 0 for no match
     */
    const matchRank = (item: Criteria, inputValue: string): number => {
        if (
            item.name.toLowerCase().includes(inputValue) ||
            item.key.toLowerCase().includes(inputValue)
        ) {
            return 2;
        }
        if (item.description?.toLowerCase().includes(inputValue)) {
            return 1;
        }
        return 0;
    };

    /**
     * renders the filtered list in chunks so that huge catalogues stay responsive
     */
    const optionList = createIncrementalList(() => inputOptions);

    $effect(() => {
        if (activeDomElement) {
            scrollInsideContainerWhenActiveDomElementIsOutOfView(
                activeDomElement,
            );
        }
    });
</script>

<div>
    <div part="lens-autocomplete-formfield">
        <input
            part="lens-autocomplete-formfield-input"
            type="text"
            bind:this={searchBarInput}
            bind:value={inputValue}
            oninput={() => optionList.reset()}
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
                    {#each optionList.items as inputOption, index}
                        <!-- a selected option is never highlighted, it cannot be
                             selected again -->
                        {#if index === focusedItemIndex && !selectedNames.has(inputOption.name)}
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                                which will close the options before the click is finshed -->
                            <li
                                bind:this={activeDomElement}
                                part="autocomplete-options-item autocomplete-options-item-focused {selectedNames.has(
                                    inputOption.name,
                                )
                                    ? 'autocomplete-options-item-selected'
                                    : ''}"
                                onmousedown={(event) =>
                                    selectItemByClick(event, inputOption)}
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
                                {#if $facetCounts[element.key] !== undefined}
                                    <div
                                        part="autocomplete-options-item-facet-count"
                                        title={$lensOptions?.facetCount
                                            ?.hoverText?.[element.key] ?? ""}
                                    >
                                        {$facetCounts[element.key][
                                            inputOption.key
                                        ] ?? 0}
                                    </div>
                                {/if}
                            </li>
                        {:else}
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                                which will close the options before the click is finshed -->
                            <li
                                part="autocomplete-options-item {selectedNames.has(
                                    inputOption.name,
                                )
                                    ? 'autocomplete-options-item-selected'
                                    : ''}"
                                onmousedown={(event) =>
                                    selectItemByClick(event, inputOption)}
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
                                {#if $facetCounts[element.key] !== undefined}
                                    <div
                                        part="autocomplete-options-item-facet-count"
                                        title={$lensOptions?.facetCount
                                            ?.hoverText?.[element.key] ?? ""}
                                    >
                                        {$facetCounts[element.key][
                                            inputOption.key
                                        ] ?? 0}
                                    </div>
                                {/if}
                            </li>
                        {/if}
                    {/each}
                    {#if optionList.hasMore}
                        <li
                            part="autocomplete-options-sentinel"
                            use:optionList.sentinel
                        ></li>
                    {/if}
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
    [part~="lens-autocomplete-formfield"] {
        margin-bottom: var(--gap-xs);
        margin-top: var(--gap-xs);
        position: relative;
    }

    /* Input field styled to match the date input */
    [part~="lens-autocomplete-formfield-input"] {
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
    [part~="lens-autocomplete-formfield-input"]:focus {
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

        display: grid;
        /* The name column takes what it needs but may shrink below its content
           width, so that a long criterion name cannot push the description out
           of the list */
        grid-template-columns:
            minmax(0, max-content) minmax(0, 1fr)
            max-content;
    }

    [part~="autocomplete-options-sentinel"] {
        grid-column: 1 / -1;
        height: 1px;
    }

    [part~="autocomplete-options-item"] {
        display: grid;
        grid-template-columns: subgrid;
        grid-column: 1 / -1; /* Full width */
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

    [part~="autocomplete-options-item"]:hover:not(
            [part~="autocomplete-options-item-focused"],
            [part~="autocomplete-options-item-selected"]
        ) {
        background-color: var(--light-gray);
    }

    /* Already in the active search bar, so it cannot be selected again */
    [part~="autocomplete-options-item-selected"] {
        opacity: 0.4;
        cursor: default;
    }

    [part~="autocomplete-options-item-name"] {
        /* Long names wrap instead of widening the column */
        min-width: 0;
        overflow-wrap: anywhere;
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

    [part~="autocomplete-options-item-facet-count"] {
        color: #636363;
        font-size: 0.95em;
        justify-self: right;
        background-color: rgb(239, 239, 252);
        padding: 1px 6px;
        border-radius: 40px;
    }
</style>
