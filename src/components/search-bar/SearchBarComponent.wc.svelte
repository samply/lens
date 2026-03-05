<svelte:options
    customElement={{
        tag: "lens-search-bar",
    }}
/>

<script lang="ts">
    import type {
        CatalogueElement,
        CatalogueOption,
        NumericRangeElement,
        DateRangeElement,
        FreeTextElement,
    } from "../../types/catalogue";
    import type { QueryItem } from "../../types/query";
    import {
        addItemToQuery,
        queryStore,
        activeQueryGroupIndex,
    } from "../../stores/query";
    import StoreDeleteButtonComponent from "../buttons/StoreDeleteButtonComponent.svelte";
    import { catalogue, elementMap, optionMap } from "../../stores/catalogue";
    import { facetCounts } from "../../stores/facetCounts";
    import { lensOptions } from "../../stores/options";
    import QueryExplainButtonComponent from "../buttons/QueryExplainButtonComponent.wc.svelte";
    import { onMount } from "svelte";
    import { showToast } from "../../stores/toasts";
    import { translate } from "../../helpers/translations";
    import { get } from "svelte/store";
    import NumberInputComponent from "../catalogue/NumberInputComponent.svelte";
    import DatePickerComponent from "../catalogue/DatePickerComponent.svelte";
    import StringInputComponent from "../catalogue/StringInputComponent.svelte";

    type SearchBarOptionItem = {
        itemType: "option";
        elementKey: string;
        elementName: string;
        option: CatalogueOption;
    };

    type SearchBarElementItem = {
        itemType: "element";
        element: NumericRangeElement | DateRangeElement | FreeTextElement;
    };

    type SearchBarItem = SearchBarOptionItem | SearchBarElementItem;

    function getItemName(item: SearchBarItem): string {
        return item.itemType === "option"
            ? item.elementName
            : item.element.name;
    }

    function getItemKey(item: SearchBarItem): string {
        return item.itemType === "option"
            ? `${item.elementKey}.${item.option.value}`
            : item.element.key;
    }

    interface Props {
        noMatchesFoundMessage?: string;
        typeMoreMessage?: string;
        placeholderText?: string;
        index?: number;
    }

    let {
        noMatchesFoundMessage = "No matches found",
        typeMoreMessage = translate("type_more_message"),
        placeholderText = "Type to filter conditions",
        index = 0,
    }: Props = $props();

    let queryBar = $derived($queryStore.bars[index]);

    let autoCompleteOpen = $state(true);

    /**
     * Flatten the catalogue tree into a list of searchable items.
     */
    const flattenCatalogue = (
        elements: CatalogueElement[],
    ): SearchBarItem[] => {
        const items: SearchBarItem[] = [];
        for (const el of elements) {
            if (el.type === "CatalogueGroup") {
                items.push(...flattenCatalogue(el.elements));
            } else if (
                el.type === "SelectElement" ||
                el.type === "AutocompleteElement"
            ) {
                for (const option of el.options) {
                    if (option.selectable !== false) {
                        items.push({
                            itemType: "option",
                            elementKey: el.key,
                            elementName: el.name,
                            option,
                        });
                    }
                    if (option.suboptions) {
                        for (const sub of option.suboptions) {
                            if (sub.selectable !== false) {
                                items.push({
                                    itemType: "option",
                                    elementKey: el.key,
                                    elementName: el.name,
                                    option: sub,
                                });
                            }
                        }
                    }
                }
            } else {
                items.push({ itemType: "element", element: el });
            }
        }
        return items;
    };

    let searchItems: SearchBarItem[] = $derived(
        flattenCatalogue(structuredClone($state.snapshot($catalogue))) || [],
    );

    let searchBarInput: HTMLInputElement;
    let inputValue: string = $state("");

    let inputOptions: SearchBarItem[] = $derived.by(() => {
        return searchItems.filter((item: SearchBarItem) => {
            const clearedInputValue = inputValue
                .replace(/^[0-9]*:/g, "")
                .toLocaleLowerCase();

            if (item.itemType === "option") {
                return (
                    item.elementName
                        .toLowerCase()
                        .includes(clearedInputValue) ||
                    item.option.name
                        .toLowerCase()
                        .includes(clearedInputValue) ||
                    item.option.description
                        ?.toLowerCase()
                        .includes(clearedInputValue)
                );
            } else {
                return item.element.name
                    .toLocaleLowerCase()
                    .includes(clearedInputValue);
            }
        });
    });

    let focusedItemIndex: number = $state(-1);

    const optionElements: HTMLElement[] = $state([]);

    let activeDomElement: HTMLElement | undefined = $derived(
        focusedItemIndex >= 0 ? optionElements[focusedItemIndex] : undefined,
    );

    const addInputValueToStore = (
        inputItem: SearchBarItem,
        indexOfChosenStore: number = $queryStore.bars.length,
    ): void => {
        if (inputItem.itemType !== "option") return;

        addItemToQuery(
            {
                type: "SetItem",
                key: inputItem.elementKey,
                negated: false,
                values: [inputItem.option.value],
            },
            indexOfChosenStore,
        );
        resetToEmptySearchBar();
    };

    const extractTargetGroupFromInputValue = (): number => {
        const splitInputValue = inputValue.split(":");
        if (splitInputValue.length > 1) {
            const groupToAddItemTo = +splitInputValue[0] - 1;
            return groupToAddItemTo;
        }
        return index;
    };

    let searchBarInputHasFoucs = $state(true);

    const handleKeyDown = (event: KeyboardEvent): void => {
        if (
            (inputValue.length === 0 || event.key === "Escape") &&
            searchBarInputHasFoucs
        ) {
            inputValue = "";
            focusedItemIndex = -1;
            return;
        }
        if (event.key === "Escape") {
            searchBarInput.focus();
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
        if (event.key === "Tab") {
            if (searchBarInputHasFoucs && event.shiftKey) {
                return;
            }
            let focusedListItem =
                document.activeElement?.shadowRoot?.activeElement?.closest(
                    "li",
                );

            const isSafari: boolean =
                /^((?!chrome|chromium|android).)*safari/i.test(
                    navigator.userAgent,
                );

            if (isSafari) {
                if (activeDomElement && activeDomElement !== focusedListItem) {
                    event.preventDefault();
                    activeDomElement.querySelector("input")?.focus();
                    return;
                }
                if (searchBarInputHasFoucs) {
                    const firstInput = optionElements
                        .find((element) => element.querySelector("input"))
                        ?.closest("li");
                    focusedItemIndex = firstInput
                        ? optionElements.indexOf(firstInput)
                        : -1;
                } else {
                    const isNextListItem =
                        document.activeElement?.shadowRoot?.activeElement
                            ?.tagName === "BUTTON";
                    if (!isNextListItem) return;
                    const nextInput = optionElements
                        .slice(focusedItemIndex + 1)
                        .find((element) => element.querySelector("input"))
                        ?.closest("li");
                    focusedItemIndex = nextInput
                        ? optionElements.indexOf(nextInput)
                        : -1;
                }
                return;
            } else if (
                (focusedListItem || searchBarInputHasFoucs || event.shiftKey) &&
                activeDomElement &&
                activeDomElement !== focusedListItem
            ) {
                event.preventDefault();
                activeDomElement?.querySelector("input")?.focus();
            }
        }
    };

    function handleFocusIn() {
        autoCompleteOpen = true;
        let focusedListItem =
            document.activeElement?.shadowRoot?.activeElement?.closest("li");
        if (focusedListItem) {
            focusedItemIndex = optionElements.indexOf(focusedListItem);
        }
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

    function focusSearchbar(): void {
        searchBarInput.focus();
    }

    let searchBarContainer: HTMLElement;

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

    const getBoldedText = (inputOption: string): string => {
        const query: string = (inputValue ?? "").trim();

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

    function formatChipValue(item: QueryItem): string {
        switch (item.type) {
            case "NumericRangeItem":
                return `${item.min ?? "∞"} – ${item.max ?? "∞"}`;
            case "DateRangeItem":
                return `${item.min ?? "∞"} – ${item.max ?? "∞"}`;
            default:
                return "";
        }
    }

    onMount(() => {
        searchBarInput.focus();
        $activeQueryGroupIndex = index;

        const queryParam = new URLSearchParams(window.location.search).get(
            "query",
        );
        if (queryParam !== null) {
            try {
                const query = JSON.parse(queryParam);
                queryStore.set(query);
            } catch {
                console.error("Failed to parse query from URL:", queryParam);
                showToast(translate("query_in_url_parse_error"), "error");
            }
        }

        queryStore.subscribe(() => {
            if (get(lensOptions)?.autoUpdateQueryInUrl ?? true) {
                const query = get(queryStore);
                const url = new URL(window.location.href);

                if (query.bars.every((b) => b.items.length === 0)) {
                    url.searchParams.delete("query");
                    window.history.replaceState({}, "", url.toString());
                } else {
                    url.searchParams.delete("query");
                    // Encode only characters meaningful in URL query
                    // strings (&, #, +, =, %) so the JSON stays
                    // human-readable in the address bar.
                    const json = JSON.stringify(query).replace(
                        /[%&#+=]/g,
                        encodeURIComponent,
                    );
                    const serialized = url.toString();
                    const sep = url.searchParams.size > 0 ? "&" : "?";
                    window.history.replaceState(
                        {},
                        "",
                        `${serialized}${sep}query=${json}`,
                    );
                }
            }
        });

        window.addEventListener("lens-search-triggered", () => {
            inputValue = "";
        });

        window.addEventListener("mouseup", () => {
            handleClickOutside();
        });

        searchBarContainer.addEventListener("focus", (event) => {
            console.log(event);
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
    onkeydown={handleKeyDown}
>
    {#if queryBar !== undefined && queryBar.items.length > 0}
        <div part="lens-searchbar-chips">
            {#each queryBar.items as item (item.key + item.type)}
                <div part="lens-searchbar-chip">
                    <span part="lens-searchbar-chip-name"
                        >{$elementMap.get(item.key)?.name ?? item.key}:</span
                    >
                    {#if item.type === "SetItem"}
                        {#each item.values as value (value)}
                            <span part="lens-searchbar-chip-item">
                                <span part="lens-searchbar-chip-item-text"
                                    >{$optionMap.get(`${item.key}.${value}`)
                                        ?.name ?? value}</span
                                >
                                <QueryExplainButtonComponent
                                    queryItemName={$elementMap.get(item.key)
                                        ?.name ?? item.key}
                                    queryItemKey={item.key}
                                    queryItemValue={value}
                                />
                                {#if item.values.length > 1}
                                    <StoreDeleteButtonComponent
                                        itemToDelete={{
                                            type: "value",
                                            barIndex: index,
                                            key: item.key,
                                            value,
                                        }}
                                    />
                                {/if}
                            </span>
                        {/each}
                    {:else}
                        <span part="lens-searchbar-chip-item">
                            <span part="lens-searchbar-chip-item-text"
                                >{formatChipValue(item)}</span
                            >
                        </span>
                    {/if}
                    <StoreDeleteButtonComponent
                        itemToDelete={{
                            type: "item",
                            barIndex: index,
                            key: item.key,
                            itemType: item.type,
                        }}
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
        placeholder={placeholderText}
        onfocusin={() => {
            autoCompleteOpen = true;
            activeQueryGroupIndex.set(index);
            searchBarInputHasFoucs = true;
        }}
        onfocusout={() => (searchBarInputHasFoucs = false)}
    />
    {#if autoCompleteOpen && inputValue.length > 1}
        <ul part="lens-searchbar-autocomplete-options">
            {#if inputOptions?.length > 0}
                {#each inputOptions as inputOption, i (getItemKey(inputOption) + i)}
                    {#if inputOptions
                        .map((option) => getItemName(option))
                        .indexOf(getItemName(inputOption)) === i}
                        <div part="lens-searchbar-autocomplete-options-heading">
                            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                            {@html getBoldedText(getItemName(inputOption))}
                        </div>
                    {/if}
                    {#if inputOption.itemType === "option"}
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
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
                                {@html getBoldedText(inputOption.option.name)}
                            </div>
                            <div
                                part="lens-searchbar-autocomplete-options-item-description {focusedItemIndex ===
                                i
                                    ? 'lens-searchbar-autocomplete-options-item-description-focused'
                                    : ''}"
                            >
                                {#if inputOption.option.description}
                                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                                    {@html getBoldedText(
                                        inputOption.option.description,
                                    )}
                                {/if}
                            </div>
                            {#if $facetCounts[inputOption.elementKey] !== undefined}
                                <div
                                    part="lens-searchbar-autocomplete-options-item-facet-count"
                                    title={$lensOptions?.facetCount
                                        ?.hoverText?.[inputOption.elementKey] ??
                                        ""}
                                >
                                    {$facetCounts[inputOption.elementKey][
                                        inputOption.option.value
                                    ] ?? 0}
                                </div>
                            {/if}
                        </li>
                    {:else if inputOption.element.type === "NumericRangeElement"}
                        <li
                            bind:this={optionElements[i]}
                            part="lens-searchbar-autocomplete-options-item {focusedItemIndex ===
                            i
                                ? 'lens-searchbar-autocomplete-options-item-focused'
                                : ''} lens-searchbar-autocomplete-options-item-numeric"
                        >
                            <NumberInputComponent
                                element={inputOption.element as NumericRangeElement}
                                inSearchBar={true}
                                {resetToEmptySearchBar}
                            />
                        </li>
                    {:else if inputOption.element.type === "DateRangeElement"}
                        <li
                            bind:this={optionElements[i]}
                            part="lens-searchbar-autocomplete-options-item {focusedItemIndex ===
                            i
                                ? 'lens-searchbar-autocomplete-options-item-focused'
                                : ''} lens-searchbar-autocomplete-options-item-date"
                        >
                            <DatePickerComponent
                                element={inputOption.element as DateRangeElement}
                                inSearchBar={true}
                                {resetToEmptySearchBar}
                            />
                        </li>
                    {:else if inputOption.element.type === "FreeTextElement"}
                        <li
                            bind:this={optionElements[i]}
                            part="lens-searchbar-autocomplete-options-item {focusedItemIndex ===
                            i
                                ? 'lens-searchbar-autocomplete-options-item-focused'
                                : ''} lens-searchbar-autocomplete-options-item-date"
                        >
                            <StringInputComponent
                                element={inputOption.element as FreeTextElement}
                                inSearchBar={true}
                                {resetToEmptySearchBar}
                            />
                        </li>
                    {/if}
                {/each}
            {:else}
                <li>{noMatchesFoundMessage}</li>
            {/if}
        </ul>
    {:else if autoCompleteOpen && inputValue.length > 0 && inputValue.length < 2}
        <ul
            part="lens-searchbar-autocomplete-options lens-searchbar-autocomplete-options-type-more-message"
        >
            <li>{typeMoreMessage}</li>
        </ul>
    {/if}
    <StoreDeleteButtonComponent
        itemToDelete={{ type: "group", barIndex: index }}
        {resetToEmptySearchBar}
    />
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
        top: calc(100% - 5px);
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
