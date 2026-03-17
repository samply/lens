<script lang="ts">
    import type { CatalogueElement } from "../../types/catalogue";
    import DataTreeElement from "./DataTreeElement.svelte";
    import AutocompleteInput from "./AutocompleteInput.svelte";
    import OptionInput from "./OptionInput.svelte";
    import NumericRangeInput from "./NumericRangeInput.svelte";
    import DateRangeInput from "./DateRangeInput.svelte";
    import FreeTextInput from "./FreeTextInput.svelte";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import { openTreeNodes } from "../../stores/catalogue";

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
        if (element.type === "CatalogueGroup") return [];
        const elementDomains =
            "domains" in element ? (element.domains ?? []) : [];
        if (elementDomains.length === 0) return [];
        return elementDomains.map((d) => ({
            key: d,
            name: d,
        }));
    });
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

        {#if domainChips.length > 0}
            <div part="lens-data-tree-domain-chips">
                {#each domainChips as chip (chip.key)}
                    <span
                        part="lens-data-tree-domain-chip"
                        class="inline-flex items-center rounded-full border border-primary-300 bg-primary-50 px-2 py-0.5 text-[11px] font-semibold leading-5 text-primary-900"
                        >{chip.name}</span
                    >
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
            <div
                part="lens-data-tree-element-last-child-options"
                style="display:grid;grid-template-columns:auto max-content max-content max-content max-content"
            >
                {#if element.type === "SelectElement"}
                    {#each element.options as option (option.value)}
                        <OptionInput {element} {option} />
                    {/each}
                {:else if element.type === "AutocompleteElement"}
                    <AutocompleteInput {element} />
                {:else if element.type === "NumericRangeElement"}
                    <NumericRangeInput {element} />
                {:else if element.type === "DateRangeElement"}
                    <DateRangeInput {element} />
                {:else if element.type === "FreeTextElement"}
                    <FreeTextInput {element} />
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
        font-weight: 500;
        white-space: nowrap;
        color: var(--font-color);
        background-color: var(--white);
        border: solid 1px var(--gray);
        line-height: 1.6;
    }
</style>
