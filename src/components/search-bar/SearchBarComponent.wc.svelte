<svelte:options
    customElement={{
        tag: "lens-search-bar",
        extend: withTailwind,
    }}
/>

<script lang="ts">
    import { withTailwind } from "../../helpers/tailwind";
    import type { CatalogueElement } from "../../types/catalogue";
    import { queryStore, activeQueryGroupIndex } from "../../stores/query";
    import StoreDeleteButtonComponent from "../buttons/StoreDeleteButtonComponent.svelte";
    import { catalogue, elementMap, optionMap } from "../../stores/catalogue";
    import { lensOptions } from "../../stores/options";
    import QueryExplainButtonComponent from "../buttons/QueryExplainButtonComponent.wc.svelte";
    import { onMount, setContext } from "svelte";
    import { showToast } from "../../stores/toasts";
    import { translate } from "../../helpers/translations";
    import { get } from "svelte/store";
    import DropdownList, {
        type DropdownItem,
    } from "../catalogue/DropdownList.svelte";

    interface Props {
        index?: number;
    }

    let { index = 0 }: Props = $props();

    setContext("lens:item-added", () => {
        inputValue = "";
        searchBarInput.focus();
    });

    let queryBar = $derived($queryStore.bars[index]);

    function flattenCatalogue(
        elements: CatalogueElement[],
    ): Exclude<DropdownItem, { type: "heading" }>[] {
        const items: Exclude<DropdownItem, { type: "heading" }>[] = [];
        for (const el of elements) {
            if (el.type === "CatalogueGroup") {
                items.push(...flattenCatalogue(el.elements));
            } else if (
                el.type === "SelectElement" ||
                el.type === "AutocompleteElement"
            ) {
                for (const option of el.options) {
                    if (option.visible !== false) {
                        items.push({ type: "option", element: el, option });
                    }
                    if (option.suboptions) {
                        for (const sub of option.suboptions) {
                            if (sub.visible !== false) {
                                items.push({
                                    type: "option",
                                    element: el,
                                    option: sub,
                                });
                            }
                        }
                    }
                }
            } else {
                items.push({ type: "input", element: el });
            }
        }
        return items;
    }

    let searchItems = $derived(
        flattenCatalogue(structuredClone($state.snapshot($catalogue))) || [],
    );

    let searchBarInput: HTMLInputElement;
    let inputValue: string = $state("");

    let dropdownRef: DropdownList | undefined = $state();

    const dropdownItems: DropdownItem[] = $derived.by(() => {
        const q = inputValue.replace(/^[0-9]*:/g, "").toLocaleLowerCase();
        const filtered = searchItems.filter((item) => {
            if (item.type === "option") {
                return (
                    item.element.name.toLowerCase().includes(q) ||
                    item.option.name.toLowerCase().includes(q) ||
                    item.option.description?.toLowerCase().includes(q)
                );
            } else {
                return item.element.name.toLocaleLowerCase().includes(q);
            }
        });
        const result: DropdownItem[] = [];
        let lastKey: string | null = null;
        for (const item of filtered) {
            if (item.element.key !== lastKey) {
                result.push({ type: "heading", label: item.element.name });
                lastKey = item.element.key;
            }
            result.push(item);
        }
        return result;
    });

    function handleKeys(event: KeyboardEvent): void {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (dropdownRef?.navigate(1) === false) searchBarInput.focus();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (dropdownRef?.navigate(-1) === false) searchBarInput.focus();
        } else if (event.key === "Escape") {
            inputValue = "";
            searchBarInput.focus();
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
    });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    part="lens-searchbar {index === $activeQueryGroupIndex
        ? 'lens-searchbar-active'
        : ''}"
    class="relative flex flex-wrap flex-1 items-center bg-white border border-gray-300 rounded py-1 px-2 w-[-webkit-fill-available] has-[input:focus]:border-primary-500
        {index === $activeQueryGroupIndex
        ? 'shadow-[0_0_13px_4px_rgba(0,0,0,0.3)] z-2'
        : 'shadow-sm z-1'}"
    onkeydown={handleKeys}
    onfocusout={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) inputValue = "";
    }}
>
    {#if queryBar !== undefined && queryBar.items.length > 0}
        <div part="lens-searchbar-chips" class="flex flex-wrap gap-2 pr-2">
            {#each queryBar.items as item (item.key + item.type + item.negated)}
                <div
                    part="lens-searchbar-chip"
                    class="text-white rounded py-1.25 pr-3 pl-2 flex flex-row flex-wrap items-center relative gap-2 {item.negated
                        ? 'bg-danger-500'
                        : 'bg-primary-500'}"
                >
                    <span part="lens-searchbar-chip-name" class="font-bold"
                        >{$elementMap.get(item.key)?.name ?? item.key}:</span
                    >
                    {#if item.type === "SetItem"}
                        {#each item.values as value (value)}
                            <span
                                part="lens-searchbar-chip-item"
                                class="inline-flex gap-1 items-center"
                            >
                                <span
                                    part="lens-searchbar-chip-item-text"
                                    class="wrap-anywhere"
                                    >{$optionMap.get(`${item.key}.${value}`)
                                        ?.name ?? value}</span
                                >
                                <QueryExplainButtonComponent
                                    queryItemName={$elementMap.get(item.key)
                                        ?.name ?? item.key}
                                    queryItemValueName={$optionMap.get(
                                        `${item.key}.${value}`,
                                    )?.name ?? value}
                                />
                                {#if item.values.length > 1}
                                    <StoreDeleteButtonComponent
                                        itemToDelete={{
                                            type: "value",
                                            barIndex: index,
                                            key: item.key,
                                            value,
                                            negated: item.negated,
                                        }}
                                    />
                                {/if}
                            </span>
                        {/each}
                    {:else}
                        <span
                            part="lens-searchbar-chip-item"
                            class="inline-flex gap-1 items-center"
                        >
                            <span
                                part="lens-searchbar-chip-item-text"
                                class="wrap-anywhere"
                                >{item.min ?? "∞"} - {item.max ?? "∞"}</span
                            >
                        </span>
                    {/if}
                    <StoreDeleteButtonComponent
                        itemToDelete={{
                            type: "item",
                            barIndex: index,
                            key: item.key,
                            itemType: item.type,
                            negated: item.negated,
                        }}
                    />
                </div>
            {/each}
        </div>
    {/if}
    <input
        part="lens-searchbar-input"
        class="box-border p-2 min-w-50 grow outline-none border-none bg-transparent"
        type="text"
        bind:this={searchBarInput}
        bind:value={inputValue}
        placeholder={translate("search_placeholder")}
        onkeydown={(e) => {
            if (e.key === "Enter") dropdownRef?.submitFocused();
        }}
        onfocusin={() => {
            activeQueryGroupIndex.set(index);
        }}
    />
    {#if inputValue.length > 0}
        <div
            class="max-h-[50vh] overflow-y-auto border border-primary-500 border-t-0 absolute top-[calc(100%-5px)] -left-px -right-px bg-white text-black rounded-bl rounded-br"
        >
            <DropdownList
                bind:this={dropdownRef}
                items={dropdownItems}
                showDescription={true}
            />
        </div>
    {/if}
    <StoreDeleteButtonComponent
        itemToDelete={{ type: "group", barIndex: index }}
    />
</div>
