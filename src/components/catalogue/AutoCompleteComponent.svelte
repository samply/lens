<script lang="ts">
    import type {
        AutocompleteElement,
        CatalogueOption,
    } from "../../types/catalogue";
    import {
        activeQueryGroupIndex,
        addItemToQuery,
        queryStore,
    } from "../../stores/query";
    import type { Query, SetItem } from "../../types/query";
    import { onMount } from "svelte";
    import { facetCounts } from "../../stores/facetCounts";
    import { lensOptions } from "../../stores/options";

    let placeholderText: string = "Type to filter conditions";
    let noMatchesFoundMessage: string = "No matches found";

    interface Props {
        element: AutocompleteElement;
    }

    let { element }: Props = $props();

    let options: CatalogueOption[] = $derived(element.options);

    const resolveSuboptions = (option: CatalogueOption): CatalogueOption[] => {
        let collected: CatalogueOption[] = [];
        if (option.selectable == undefined && !option.selectable) {
            collected.push(option);
        }

        if (option.suboptions != undefined) {
            option.suboptions.forEach((sub: CatalogueOption) => {
                collected = collected.concat(resolveSuboptions(sub));
            });
        }
        return collected;
    };

    onMount(() => {
        searchBarInput.focus();

        let suboptions: CatalogueOption[] = [];
        options.forEach((opt) => {
            if (opt.suboptions != undefined) {
                opt.suboptions.forEach((sub: CatalogueOption) => {
                    suboptions = suboptions.concat(resolveSuboptions(sub));
                });
            }
        });

        options = options.concat(suboptions);
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

    const getChosenValuesFromQueryStore = (query: Query): string[] => {
        return query.bars
            .flatMap((bar) => bar.items)
            .filter(
                (item) => item.key === element.key && item.type === "SetItem",
            )
            .flatMap((item) => (item as SetItem).values);
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
        inputItem: CatalogueOption,
        indexOfChosenStore: number,
    ): void => {
        const optionAlreadyPresent = chosenValues.includes(inputItem.value);

        if (optionAlreadyPresent) {
            return;
        }

        addItemToQuery(
            {
                type: "SetItem",
                key: element.key,
                negated: false,
                values: [inputItem.value],
            },
            indexOfChosenStore,
        );

        inputValue = "";
        focusedItemIndex = 0;
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
    const selectItemByClick = (inputOption: CatalogueOption): void => {
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
    let inputOptions: CatalogueOption[] = $derived.by(() => {
        return options.filter((item: CatalogueOption) => {
            const clearedInputValue = inputValue
                .replace(/^[0-9]*:/g, "")
                .toLocaleLowerCase();

            return (
                item.name.toLowerCase().includes(clearedInputValue) ||
                item.value.toLowerCase().includes(clearedInputValue) ||
                item.description?.toLowerCase().includes(clearedInputValue)
            );
        });
    });

    /**
     * list of options that allready have been chosen and should be displayed beneath the autocomplete input
     * chosenOptions are constructed from the query store and has no duplicates
     * if an option is put into the store from anywhere it will update
     */
    let chosenValues = $derived(getChosenValuesFromQueryStore($queryStore));

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
                                {#if $facetCounts[element.key] !== undefined}
                                    <div
                                        part="autocomplete-options-item-facet-count"
                                        title={$lensOptions?.facetCount
                                            ?.hoverText?.[element.key] ?? ""}
                                    >
                                        {$facetCounts[element.key][
                                            inputOption.value
                                        ] ?? 0}
                                    </div>
                                {/if}
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
                                {#if $facetCounts[element.key] !== undefined}
                                    <div
                                        part="autocomplete-options-item-facet-count"
                                        title={$lensOptions?.facetCount
                                            ?.hoverText?.[element.key] ?? ""}
                                    >
                                        {$facetCounts[element.key][
                                            inputOption.value
                                        ] ?? 0}
                                    </div>
                                {/if}
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
        grid-template-columns: max-content auto max-content;
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
            [part~="autocomplete-options-item-focused"]
        ) {
        background-color: var(--light-gray);
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
