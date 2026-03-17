<script lang="ts">
    import type {
        LeafCatalogueElement,
        CatalogueOption,
    } from "../../types/catalogue";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { getContext } from "svelte";
    import FacetCount from "./FacetCount.svelte";
    import AddButton from "./AddButton.svelte";

    interface Props {
        element: LeafCatalogueElement;
        option: CatalogueOption;
        showDescription?: boolean;
    }

    let { element, option, showDescription = false }: Props = $props();

    const onItemAdded = getContext<(() => void) | undefined>("lens:item-added");

    export function submit({
        negated = false,
    }: { negated?: boolean } = {}): void {
        addItemToQuery(
            {
                type: "SetItem",
                key: element.key,
                negated,
                values: [option.value],
            },
            $activeQueryGroupIndex,
        );
        onItemAdded?.();
    }
</script>

<div class="grid grid-cols-subgrid col-span-full items-center">
    <div class="flex items-center">
        {#if option.description && !showDescription}
            <abbr title={option.description} class="cursor-help"
                >{option.name}</abbr
            >
        {:else}
            <span>{option.name}</span>
        {/if}
    </div>
    <div class="flex items-center text-xs text-primary-600 px-1">
        {#if showDescription && option.description}
            {option.description}
        {/if}
    </div>
    <div class="flex items-center">
        <FacetCount {element} {option} />
    </div>
    <div class="flex items-center">
        <AddButton negated={false} onclick={() => submit()} />
    </div>
    <div class="flex items-center">
        {#if element.negatable}
            <AddButton
                negated={true}
                onclick={() => submit({ negated: true })}
            />
        {/if}
    </div>
</div>
