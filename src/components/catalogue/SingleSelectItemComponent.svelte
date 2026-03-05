<script lang="ts">
    import type { SelectElement, CatalogueOption } from "../../types/catalogue";
    import AddButton from "./AddButton.svelte";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { facetCounts } from "../../stores/facetCounts";
    import { lensOptions } from "../../stores/options";

    interface Props {
        element: SelectElement;
        option: CatalogueOption;
    }

    let { element, option }: Props = $props();

    function onclick() {
        addItemToQuery(
            {
                type: "SetItem",
                key: element.key,
                negated: false,
                values: [option.value],
            },
            $activeQueryGroupIndex,
        );
    }
</script>

{#if option.description}
    <abbr part="lens-singleselect-item-underline" title={option.description}
        >{option.name}</abbr
    >
{:else}
    <span>{option.name}</span>
{/if}
{#if $facetCounts[element.key] !== undefined}
    <span
        part="lens-single-select-facet-count"
        title={$lensOptions?.facetCount?.hoverText?.[element.key] ?? ""}
    >
        {$facetCounts[element.key][option.value] ?? 0}
    </span>
{:else}
    <span></span>
{/if}
<AddButton inSearchBar={false} {onclick} />

<style>
    [part~="lens-single-select-facet-count"] {
        color: #636363;
        font-size: 0.95em;
        justify-self: right;
        background-color: rgb(239, 239, 252);
        padding: 1px 6px;
        border-radius: 40px;
    }
    [part~="lens-singleselect-item-underline"] {
        cursor: help;
    }
</style>
