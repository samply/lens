<svelte:options
    customElement={{
        tag: "lens-search-bar-multiple",
    }}
/>

<script lang="ts">
    import { queryStore } from "../../stores/query";
    import SearchBarComponent from "./SearchBarComponent.wc.svelte";
    import type { QueryItem } from "../../types/queryData";

    interface Props {
        noMatchesFoundMessage?: string;
        placeholderText?: string;
    }

    let {
        noMatchesFoundMessage = "No matches found",
        placeholderText = "Type to filter conditions",
    }: Props = $props();

    /**
     * Adds a new search bar to the query store
     */
    const addSearchBar = (): void => {
        queryStore.update((queryStore: QueryItem[][]): QueryItem[][] => {
            queryStore.push([]);
            return queryStore;
        });
    };
</script>

<div part="lens-searchbar-multiple">
    {#each $queryStore, index}
        <div part="search-bar-wrapper">
            <SearchBarComponent
                {noMatchesFoundMessage}
                {placeholderText}
                {index}
            />
            {#if index === $queryStore.length - 1}
                <button part="lens-searchbar-add-button" onclick={addSearchBar}
                    >+</button
                >
            {:else}
                <span part="lens-searchbar-or-indicator">or</span>
            {/if}
        </div>
    {/each}
    <!-- here is a slot mainly for the search button if whished to place in this component -->
    <slot />
</div>
