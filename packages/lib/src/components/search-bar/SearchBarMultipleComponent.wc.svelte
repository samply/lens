<svelte:options
    customElement={{
        tag: "lens-search-bar-multiple",
        props: {
            treeData: { type: "Object" },
            noMatchesFoundMessage: { type: "String" },
            chips: { type: "Boolean" },
        },
    }}
/>

<script lang="ts">
    import type { Category } from "../../types/treeData";
    import { queryStore } from "../../stores/query";
    import SearchBarComponent from "./SearchBarComponent.wc.svelte";
    import type { QueryItem } from "../../types/queryData";

    /**
     * props
     * @param treeData takes a Category tree to build the autocomplete items from
     * @param noMatchesFoundMessage takes a string to display when no matches are found
     */
    export let treeData: Category[] = [];
    export let noMatchesFoundMessage: string = "No matches found";
    export let placeholderText: string = "Type to filter conditions";
    export let chips: boolean = true;

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
    {#each $queryStore as queryGroup, index}
        <div part="search-bar-wrapper">
            <SearchBarComponent
                {treeData}
                {noMatchesFoundMessage}
                {placeholderText}
                {chips}
                {queryGroup}
                {index}
            />
            {#if index === $queryStore.length - 1}
                <button part="lens-searchbar-add-button" on:click={addSearchBar}
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
