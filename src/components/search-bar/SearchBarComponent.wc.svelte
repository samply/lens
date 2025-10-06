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
        DateRangeCategory,
        NumericRangeCategory,
        StringCategory,
    } from "../../types/catalogue";
    import {
        addItemToQuery,
        queryStore,
        activeQueryGroupIndex,
    } from "../../stores/query";
    import {
        type AutoCompleteCriterionItem,
        type AutoCompleteItem,
        type QueryItem,
    } from "../../types/queryData";
    import { v4 as uuidv4 } from "uuid";
    import StoreDeleteButtonComponent from "../buttons/StoreDeleteButtonComponent.svelte";
    import { catalogue } from "../../stores/catalogue";
    import { facetCounts } from "../../stores/facetCounts";
    import { lensOptions } from "../../stores/options";
    import QueryExplainButtonComponent from "../buttons/QueryExplainButtonComponent.wc.svelte";
    import { onMount } from "svelte";
    import { showToast } from "../../stores/toasts";
    import { translate } from "../../helpers/translations";
    import { get } from "svelte/store";
    import { SvelteURL } from "svelte/reactivity";
    import NumberInputComponent from "../catalogue/NumberInputComponent.svelte";
    import DatePickerComponent from "../catalogue/DatePickerComponent.svelte";
    import StringInputComponent from "../catalogue/StringInputComponent.svelte";

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
    ): AutoCompleteCriterionItem[] => {
        let autoCompleteItems: AutoCompleteCriterionItem[] = [];
        if ("criteria" in category) {
            if (criterion.visible == undefined && !criterion.visible) {
                autoCompleteItems.push({
                    fieldType: "criterion",
                    name: category.name,
                    key: category.key,
                    type: category.type,
                    system: category.system,
                    criterion: criterion,
                });
            }
            if (criterion.subgroup !== undefined) {
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
        if (
            category.fieldType === "autocomplete" ||
            category.fieldType === "single-select"
        ) {
            category.criteria.forEach((criterion: Criteria) => {
                if (
                    criterion.visible === true ||
                    criterion.visible === undefined
                ) {
                    autoCompleteItems.push({
                        fieldType: "criterion",
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
        } else if (category.fieldType !== "group") {
            autoCompleteItems.push(category);
        }

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

            switch (item.fieldType) {
                case "criterion": {
                    return (
                        item.name.toLowerCase().includes(clearedInputValue) ||
                        item.criterion.name
                            .toLowerCase()
                            .includes(clearedInputValue) ||
                        item.criterion.description
                            ?.toLowerCase()
                            .includes(clearedInputValue)
                    );
                }
                case "number":
                case "date":
                case "string":
                    return item.name
                        .toLocaleLowerCase()
                        .includes(clearedInputValue);
                default:
                    return false;
            }
        });
    });

    /**
     * keeps track of the focused item
     */
    let focusedItemIndex: number = $state(-1);

    const optionElements: HTMLElement[] = $state([]);

    let activeDomElement: HTMLElement | undefined = $derived(
        focusedItemIndex >= 0 ? optionElements[focusedItemIndex] : undefined,
    );

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
        if (!(inputItem.fieldType === "criterion")) return;

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
        resetToEmptySearchBar();
        autoCompleteOpen = false;
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
     * handles keyboard events to make input options selectable and form elements tabable
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
        if (event.key === "Tab" && !event.shiftKey) {
            if (activeDomElement?.querySelector("input")) {
                event.preventDefault();
                activeDomElement?.querySelector("input")?.focus();
            }
        }
    };

    function handleFocusIn() {
        autoCompleteOpen = true;
    }

    function handleFocusOut(event: FocusEvent) {
        if (searchBarContainer.contains(event.relatedTarget as Node) || inside)
            return;
        autoCompleteOpen = false;
    }

    let inside: boolean = $state(false);

    function handleClickInside(): void {
        inside = true;
    }

    function handleClickOutside(): void {
        if (!inside) {
            autoCompleteOpen = false;
        }
        inside = false;
    }

    function resetToEmptySearchBar(focus: boolean = true): void {
        inputValue = "";
        focusedItemIndex = -1;
        if (focus) {
            focusSearchbar();
        }
    }

    // needed as function to be passed to children
    function focusSearchbar(): void {
        searchBarInput.focus();
    }

    let searchBarContainer: HTMLElement;

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
     * @param inputOption - the input option to bold
     * @returns the input option with the matched substring wrapped in <strong> tags
     */
    const getBoldedText = (inputOption: string): string => {
        const query: string = (inputValue ?? "").trim();

        // safety layer for passing html via name attribute in catalogue
        inputOption = escapeHtml(inputOption);
        if (!query) return inputOption;

        const pattern: RegExp = new RegExp(escapeRegExp(query), "gi");
        if (!pattern.test(inputOption)) return inputOption;

        return inputOption.replace(
            pattern,
            (match) => `<strong>${escapeHtml(match)}</strong>`,
        );
    };

    function escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function escapeHtml(string: string): string {
        return string.replace(
            /[&<>"']/g,
            (c) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[c]!,
        );
    }

    onMount(() => {
        //sets focus in the new bar when added
        searchBarInput.focus();
        $activeQueryGroupIndex = index;

        // load the query from the URL if it exists
        const encodedQuery = new URLSearchParams(window.location.search).get(
            "query",
        );
        if (encodedQuery !== null) {
            try {
                const query = JSON.parse(
                    new TextDecoder().decode(
                        Uint8Array.from(atob(encodedQuery), (c) =>
                            c.charCodeAt(0),
                        ),
                    ),
                );
                queryStore.set(query);
            } catch {
                console.error("Failed to parse query from URL:", encodedQuery);
                showToast(translate("query_in_url_parse_error"), "error");
            }
        }

        // update the URL when the query changes
        queryStore.subscribe(() => {
            if (get(lensOptions)?.autoUpdateQueryInUrl ?? true) {
                const query = get(queryStore);
                const url = new SvelteURL(window.location.href);

                if (query.flat().length === 0) {
                    url.searchParams.delete("query");
                } else {
                    const encodedQuery = btoa(
                        String.fromCharCode(
                            ...new TextEncoder().encode(JSON.stringify(query)),
                        ),
                    );
                    url.searchParams.set("query", encodedQuery);
                }

                window.history.replaceState({}, "", url.toString());
            }
        });

        window.addEventListener("reset-all-searchbar-inputs", () => {
            inputValue = "";
        });

        window.addEventListener("mouseup", () => {
            handleClickOutside();
        });
    });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    part="lens-searchbar {index === $activeQueryGroupIndex
        ? 'lens-searchbar-active'
        : ''}"
    bind:this={searchBarContainer}
    onfocusin={handleFocusIn}
    onmousedown={handleClickInside}
    onfocusout={handleFocusOut}
>
    {#if queryGroup !== undefined && queryGroup.length > 0}
        <div part="lens-searchbar-chips">
            {#each queryGroup as queryItem (queryItem.id)}
                <div part="lens-searchbar-chip">
                    <span part="lens-searchbar-chip-name"
                        >{queryItem.name}:</span
                    >
                    {#each queryItem.values as value (value.queryBindId)}
                        <span part="lens-searchbar-chip-item">
                            <span part="lens-searchbar-chip-item-text"
                                >{value.name}</span
                            >
                            <QueryExplainButtonComponent
                                queryItemName={queryItem.name}
                                queryItemValue={value}
                            />
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
        part={`lens-searchbar-input ${inputValue?.length > 0 ? "lens-searchbar-input-options-open" : ""}`}
        type="text"
        bind:this={searchBarInput}
        bind:value={inputValue}
        onkeydown={handleKeyDown}
        placeholder={placeholderText}
        onfocusin={() => {
            autoCompleteOpen = true;
            activeQueryGroupIndex.set(index);
        }}
    />
    {#if autoCompleteOpen && inputValue.length > -1}
        <ul part="lens-searchbar-autocomplete-options">
            {#if inputOptions?.length > 0}
                {#each inputOptions as inputOption, i (inputOption.key + i)}
                    <!-- TODO: this double loop makes the autocomplete slow with big data loads. Is there a better way to make the category headers? -->
                    {#if inputOptions
                        .map((option) => option.name)
                        .indexOf(inputOption.name) === i}
                        <div part="lens-searchbar-autocomplete-options-heading">
                            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                            {@html getBoldedText(inputOption.name)}
                        </div>
                    {/if}
                    {#if "criterion" in inputOption}
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                             which will close the options before the click is finshed -->
                        <li
                            class="criterion-item"
                            bind:this={optionElements[i]}
                            onmousedown={() =>
                                addInputValueToStore(
                                    inputOption,
                                    extractTargetGroupFromInputValue(),
                                )}
                            part="lens-searchbar-autocomplete-options-item {focusedItemIndex ===
                            i
                                ? 'lens-searchbar-autocomplete-options-item-focused'
                                : ''} lens-searchbar-autocomplete-options-item-criterion"
                        >
                            <div
                                part="lens-searchbar-autocomplete-options-item-name"
                            >
                                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                {@html getBoldedText(
                                    inputOption.criterion.name,
                                )}
                            </div>
                            <div
                                part="lens-searchbar-autocomplete-options-item-description {focusedItemIndex ===
                                i
                                    ? 'lens-searchbar-autocomplete-options-item-description-focused'
                                    : ''}"
                            >
                                {#if inputOption.criterion.description}
                                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                    {@html getBoldedText(
                                        inputOption.criterion.description,
                                    )}
                                {/if}
                            </div>
                            {#if $facetCounts[inputOption.key] !== undefined}
                                <div
                                    part="lens-searchbar-autocomplete-options-item-facet-count"
                                    title={$lensOptions?.facetCount
                                        ?.hoverText?.[inputOption.key] ?? ""}
                                >
                                    {$facetCounts[inputOption.key][
                                        inputOption.criterion.key
                                    ] ?? 0}
                                </div>
                            {/if}
                        </li>
                    {/if}
                    {#if inputOption.fieldType === "number"}
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                             which will close the options before the click is finshed -->
                        <li
                            bind:this={optionElements[i]}
                            onmousedown={() =>
                                addInputValueToStore(
                                    inputOption,
                                    extractTargetGroupFromInputValue(),
                                )}
                            part="lens-searchbar-autocomplete-options-item {focusedItemIndex ===
                            i
                                ? 'lens-searchbar-autocomplete-options-item-focused'
                                : ''} lens-searchbar-autocomplete-options-item-numeric"
                        >
                            <NumberInputComponent
                                element={inputOption as NumericRangeCategory}
                                inSearchBar={true}
                                setActiveElement={(activate: boolean = true) =>
                                    (focusedItemIndex = activate ? i : -1)}
                                {resetToEmptySearchBar}
                                {focusSearchbar}
                            />
                        </li>
                    {/if}
                    {#if inputOption.fieldType === "date"}
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                             which will close the options before the click is finshed -->
                        <li
                            bind:this={optionElements[i]}
                            onmousedown={() =>
                                addInputValueToStore(
                                    inputOption,
                                    extractTargetGroupFromInputValue(),
                                )}
                            part="lens-searchbar-autocomplete-options-item {focusedItemIndex ===
                            i
                                ? 'lens-searchbar-autocomplete-options-item-focused'
                                : ''} lens-searchbar-autocomplete-options-item-date"
                        >
                            <DatePickerComponent
                                element={inputOption as DateRangeCategory}
                                inSearchBar={true}
                                setActiveElement={(activate: boolean = true) =>
                                    (focusedItemIndex = activate ? i : -1)}
                                {resetToEmptySearchBar}
                                {focusSearchbar}
                            />
                        </li>
                    {/if}
                    {#if inputOption.fieldType === "string"}
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <!-- onmousedown is chosen because the input looses focus when clicked outside, 
                             which will close the options before the click is finshed -->
                        <li
                            bind:this={optionElements[i]}
                            onmousedown={() =>
                                addInputValueToStore(
                                    inputOption,
                                    extractTargetGroupFromInputValue(),
                                )}
                            part="lens-searchbar-autocomplete-options-item {focusedItemIndex ===
                            i
                                ? 'lens-searchbar-autocomplete-options-item-focused'
                                : ''} lens-searchbar-autocomplete-options-item-date"
                        >
                            <StringInputComponent
                                element={inputOption as StringCategory}
                                inSearchBar={true}
                                setActiveElement={(activate: boolean = true) =>
                                    (focusedItemIndex = activate ? i : -1)}
                                {resetToEmptySearchBar}
                                {focusSearchbar}
                            />
                        </li>
                    {/if}
                {/each}
            {:else}
                <li>{noMatchesFoundMessage}</li>
            {/if}
        </ul>
    {:else if autoCompleteOpen && inputValue.length > 0 && inputValue.length < 3}
        <ul
            part="lens-searchbar-autocomplete-options lens-searchbar-autocomplete-options-type-more-message"
        >
            <li>{typeMoreMessage}</li>
        </ul>
    {/if}
    <StoreDeleteButtonComponent itemToDelete={{ type: "group", index }} />
</div>

<style>
    /**
    * Lens Search Bar
    */

    [part~="lens-searchbar"] {
        position: relative;
        z-index: 1;
        align-items: center;
        background-color: var(--white);
        border: solid 1px var(--light-gray);
        border-radius: var(--border-radius-small);
        padding: var(--gap-xxs) var(--gap-xs);
        display: flex;
        flex-wrap: wrap;
        width: -webkit-fill-available;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        flex: 1;
    }

    [part~="lens-searchbar"]:has(input:focus) {
        border-color: var(--blue);
    }

    [part~="lens-searchbar-active"] {
        box-shadow: 0px 0px 13px 4px rgba(0, 0, 0, 0.3);
        z-index: 2;
    }

    [part~="lens-searchbar-input"] {
        box-sizing: border-box;
        padding: var(--gap-xs);
        min-width: 200px;
        flex-grow: 1;
        outline: none;
        border: none;
        background-color: transparent;
    }

    [part~="lens-searchbar-chips"] {
        display: flex;
        flex-wrap: wrap;
        gap: var(--gap-xs);
        padding-right: var(--gap-xs);
    }

    [part~="lens-searchbar-chip-name"] {
        font-weight: bold;
    }

    [part~="lens-searchbar-chip"] {
        background-color: var(--blue);
        color: var(--white);
        border-radius: var(--border-radius-small);
        padding: 5px var(--gap-s) 5px var(--gap-xs);
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        position: relative;
        gap: var(--gap-xs);
    }

    [part~="lens-searchbar-chip-item"] {
        display: inline-flex;
        gap: var(--gap-xxs);
        align-items: center;
    }

    [part~="lens-searchbar-chip-item-text"] {
        overflow-wrap: anywhere; /* prefers breaking at spaces, but will break mid-word if needed */
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
        top: 40px;
        left: -1px;
        right: -1px;
        background-color: var(--white);
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
        gap: var(--gap-xs);
        padding: var(--gap-xxs) var(--gap-xs);
    }

    [part~="lens-searchbar-autocomplete-options-item-criterion"] {
        cursor: pointer;
    }

    [part~="lens-searchbar-autocomplete-options-heading"] {
        font-weight: bold;
        grid-column: 1 / -1;
    }

    [part~="lens-searchbar-autocomplete-options-item-focused"] {
        color: var(--white);
        background-color: var(--blue);
    }

    [part~="lens-searchbar-autocomplete-options-item"]:hover:not(
            [part~="lens-searchbar-autocomplete-options-item-focused"]
        ) {
        background-color: var(--light-gray);
    }

    [part~="lens-searchbar-autocomplete-options-item-description"] {
        color: var(--blue);
        font-size: var(--font-size-s);
    }
    [part~="lens-searchbar-autocomplete-options-item-description-focused"] {
        color: var(--white);
    }
    [part~="lens-searchbar-autocomplete-options-item-facet-count"] {
        color: #636363;
        font-size: 0.95em;
        justify-self: right;
        background-color: rgb(239, 239, 252);
        padding: 1px 6px;
        border-radius: 40px;
    }
</style>
