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

<style>
    /**
  * Lens Search Bar
  */
    [part~="lens-searchbar-multiple"] {
        display: flex;
        flex-wrap: wrap;
        gap: var(--gap-xs);
        align-items: center;
    }

    [part~="search-bar-wrapper"] {
        display: flex;
        align-items: center;
        min-width: calc(50% - 5px);
        flex-grow: 1;
    }

    [part~="lens-searchbar-or-indicator"] {
        margin-left: var(--gap-xs);
        text-align: center;
        width: 40px;
    }

    [part~="lens-searchbar-add-button"] {
        background-color: var(--green);
        color: var(--white);
        border: none;
        border-radius: var(--border-radius-small);
        padding: 0;
        font-size: var(--font-size-m);
        cursor: pointer;
        align-self: normal;
        line-height: 22px;
        width: 40px;
        margin-left: var(--gap-xs);
    }
</style>
