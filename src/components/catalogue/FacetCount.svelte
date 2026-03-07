<script lang="ts">
    import type {
        LeafCatalogueElement,
        CatalogueOption,
    } from "../../types/catalogue";
    import { facetCounts } from "../../stores/facetCounts";
    import { lensOptions } from "../../stores/options";

    interface Props {
        element: LeafCatalogueElement;
        option: CatalogueOption;
    }

    let { element, option }: Props = $props();

    const facetCount = $derived.by(() => {
        if ($facetCounts[element.key] === undefined) return null;
        return $facetCounts[element.key][option.value] ?? 0;
    });

    const facetCountTitle = $derived(
        $lensOptions?.facetCount?.hoverText?.[element.key] ?? "",
    );
</script>

{#if facetCount !== null}
    <span
        class="text-gray-500 text-sm bg-indigo-50 px-1.5 py-px rounded-full"
        title={facetCountTitle}
    >
        {facetCount}
    </span>
{/if}
