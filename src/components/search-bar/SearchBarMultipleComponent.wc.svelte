<svelte:options
    customElement={{
        tag: "lens-search-bar-multiple",
        extend: withTailwind,
    }}
/>

<script lang="ts">
    import { CirclePlus } from "lucide-svelte";
    import { translate } from "../../helpers/translations";
    import { withTailwind } from "../../helpers/tailwind";
    import { queryStore } from "../../stores/query";
    import SearchBarComponent from "./SearchBarComponent.wc.svelte";

    /**
     * Adds a new search bar to the query store
     */
    const addSearchBar = (): void => {
        queryStore.update((query) => {
            query.bars.push({ items: [] });
            return query;
        });
    };
</script>

<div
    part="lens-searchbar-multiple"
    class="grid w-full grid-cols-1 auto-rows-max gap-2"
>
    {#each $queryStore.bars, index}
        <div part="lens-searchbar-multiple-wrapper" class="block w-full">
            <div class="flex w-full items-center gap-2">
                <div class="min-w-0 flex-1">
                    <SearchBarComponent {index} />
                </div>
                {#if index === $queryStore.bars.length - 1}
                    <button
                        part="lens-searchbar-multiple-add-button"
                        class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                        type="button"
                        aria-label={translate("search_bar_add")}
                        title={translate("search_bar_add")}
                        onclick={addSearchBar}
                    >
                        <CirclePlus size={16} />
                    </button>
                {:else}
                    <span
                        part="lens-searchbar-multiple-or-indicator"
                        class="inline-flex h-8 w-8 shrink-0 items-center justify-center text-xs text-gray-500"
                        >{translate("search_bar_or")}</span
                    >
                {/if}
            </div>
        </div>
    {/each}
</div>
