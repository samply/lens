<script lang="ts">
    import { addItemToQuery, activeQueryGroupIndex } from "../../stores/query";
    import type {
        CatalogueElement,
        SelectElement,
        CatalogueOption,
    } from "../../types/catalogue";
    import DataTreeElement from "./DataTreeElement.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import StringInputComponent from "./StringInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";
    import SingleSelectComponent from "./SingleSelectComponent.svelte";
    import { openTreeNodes } from "../../stores/catalogue";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import DatePickerComponent from "./DatePickerComponent.svelte";
    import { translate } from "../../helpers/translations";
    import { lensOptions } from "../../stores/options";

    interface Props {
        element: CatalogueElement;
        layer?: number;
        treeOpen?: boolean;
    }

    let { element, layer = 1, treeOpen = false }: Props = $props();

    let open = $derived.by(() => {
        if (
            element.type !== "CatalogueGroup" &&
            $openTreeNodes.get(element.key)
        ) {
            return true;
        }
        if (
            element.type === "CatalogueGroup" &&
            $openTreeNodes.get(element.name)
        ) {
            return true;
        }
        return false;
    });

    const toggleChildren = (): void => {
        const nodeKey =
            element.type === "CatalogueGroup" ? element.name : element.key;
        openTreeNodes.update((store) => {
            if (store.has(nodeKey)) {
                store.delete(nodeKey);
            } else {
                store.set(nodeKey, { key: nodeKey, opened: true });
            }
            return store;
        });
    };

    const domainChips = $derived.by(() => {
        const opts = $lensOptions;
        if (!opts?.domains || Object.keys(opts.domains).length === 0) return [];
        if (element.type === "CatalogueGroup") return [];
        const elementDomains =
            "domains" in element ? (element.domains ?? []) : [];
        if (elementDomains.length === 0) {
            return [
                {
                    key: "__all__",
                    name: translate("domain_chip_all"),
                    color: null,
                },
            ];
        }
        return elementDomains.map((d) => ({
            key: d,
            name: opts.domains![d]?.name ?? d,
            color: opts.domains![d]?.color ?? null,
        }));
    });

    const isSelectElement = $derived(element.type === "SelectElement");

    const selectAllOptions = (): void => {
        if (element.type !== "SelectElement") return;
        const sel = element as SelectElement;

        sel.options.forEach((option: CatalogueOption) => {
            addItemToQuery(
                {
                    type: "SetItem",
                    key: sel.key,
                    negated: false,
                    values: [option.value],
                },
                $activeQueryGroupIndex,
            );
        });
    };
</script>

<div part="data-tree-element">
    <div part="lens-data-tree-element-header">
        <button part="lens-data-tree-element-name" onclick={toggleChildren}>
            <div
                part="lens-data-tree-element-toggle-icon {open
                    ? 'lens-data-tree-element-toggle-icon-open'
                    : ''}"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"><path d="m9 18 6-6-6-6" /></svg
                >
            </div>
            {element.name}
        </button>
        {#if element.infoButtonText}
            <InfoButtonComponent
                message={element.infoButtonText}
                buttonSize={18}
            />
        {/if}

        {#if "infoLink" in element && element.infoLink !== undefined}
            <a href={element.infoLink.link} target="_blank"
                >{element.infoLink.display}</a
            >
        {/if}

        {#if isSelectElement && open}
            <button
                part="lens-data-tree-add-all-options-button"
                onclick={selectAllOptions}
            >
                {translate("add_all")}
            </button>
        {/if}

        {#if domainChips.length > 0}
            <div part="lens-data-tree-domain-chips">
                {#each domainChips as chip (chip.key)}
                    {#if chip.color !== null}
                        <span
                            part="lens-data-tree-domain-chip"
                            style="--domain-chip-color: {chip.color}; background-color: {chip.color};"
                            >{chip.name}</span
                        >
                    {:else}
                        <span
                            part="lens-data-tree-domain-chip lens-data-tree-domain-chip-all"
                            >{chip.name}</span
                        >
                    {/if}
                {/each}
            </div>
        {/if}
    </div>

    {#if open}
        {#if element.type === "CatalogueGroup"}
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each element.elements as child}
                <div
                    part={`lens-data-tree-element-child-category lens-data-tree-element-child-category-layer-${layer}`}
                >
                    <DataTreeElement
                        layer={layer + 1}
                        element={child}
                        {treeOpen}
                    />
                </div>
            {/each}
        {:else}
            <div part="lens-data-tree-element-last-child-options">
                {#if element.type === "SelectElement"}
                    <SingleSelectComponent {element} />
                {:else if element.type === "AutocompleteElement"}
                    <AutocompleteComponent {element} />
                {:else if element.type === "NumericRangeElement"}
                    <NumberInputComponent {element} />
                {:else if element.type === "FreeTextElement"}
                    <StringInputComponent {element} />
                {:else if element.type === "DateRangeElement"}
                    <DatePickerComponent {element} />
                {/if}
            </div>
        {/if}
    {/if}
</div>

<style>
    [part~="lens-data-tree-element-header"] {
        display: flex;
        gap: var(--gap-xs);
        align-items: center;
        margin-bottom: var(--gap-xxs);
    }

    [part~="lens-data-tree-element-name"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xxs);
        font-family: var(--font-family);
        color: var(--font-color);
        padding: 0;
        font-size: var(--font-size-m);
        border: none;
        background-color: unset;
        cursor: pointer;
        text-align: left;
    }

    [part~="lens-data-tree-element-toggle-icon"] {
        transform: rotate(0deg);
        transition: all 0.1s ease-in-out;
    }

    [part~="lens-data-tree-element-toggle-icon-open"] {
        transform: rotate(90deg);
    }

    [part~="data-tree-element-toggle-icon-open"] {
        transform: rotate(90deg);
    }

    [part~="lens-data-tree-add-all-options-button"] {
        background-color: var(--button-background-color);
        border-radius: var(--border-radius-small);
        color: var(--button-color);
        padding: 3px 8px;
        cursor: pointer;
        border: none;
    }

    [part~="lens-data-tree-element-child-category"] {
        padding: var(--gap-xs) 0 0 var(--gap-s);
        border-left: solid 1px var(--lightest-gray);
        margin-left: var(--gap-xs);
    }

    [part~="lens-data-tree-element-last-child-options"] {
        max-width: 100%;
        border-left: solid 1px var(--lightest-gray);
        margin-left: var(--gap-xs);
        padding-left: var(--gap-m);
        padding-top: var(--gap-xs);
        padding-bottom: var(--gap-xs);
    }

    [part~="lens-data-tree-domain-chips"] {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-left: auto;
    }

    [part~="lens-data-tree-domain-chip"] {
        display: inline-flex;
        align-items: center;
        padding: 1px 7px;
        border-radius: 10px;
        font-size: var(--font-size-xxs);
        font-family: var(--font-family);
        font-weight: 600;
        white-space: nowrap;
        color: #ffffff;
        line-height: 1.6;
    }

    [part~="lens-data-tree-domain-chip-all"] {
        background-color: var(--light-gray);
        color: var(--gray);
        font-weight: 400;
    }
</style>
