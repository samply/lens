<svelte:options
    customElement={{
        tag: "lens-catalogue",
        props: {
            treeData: { type: "Object" },
            texts: { type: "Object" },
            toggle: { type: "Object" },
            open: { type: "Boolean" },
        },
    }}
/>

<script lang="ts">
    import { catalogueTextStore } from "../../stores/texts";
    import type { ToggleAttribute } from "../../types/helpers";
    import type { CatalogueText } from "../../types/texts";
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import { slide } from "svelte/transition";


    export let treeData: Category[] = [];
    export let texts: CatalogueText = {};


    /**
     * handle the toggle of the catalogue
     */
    export let toggle: ToggleAttribute = {
        collapsable: true,
        open: true,
        animated: true,
    };

    const handleToggle = () => {
        toggle.open = !toggle.open;
    };


    /**
     * Initialize the catalogue text store with the given texts
     */
    let initializedTexts = {
        group: texts.group || "Group",
        collapseButtonTitle: texts.collapseButtonTitle || "Collapse Tree",
        numberInput: {
            labelFrom: texts.numberInput?.labelFrom || "From",
            labelTo: texts.numberInput?.labelTo || "to",
        },
    };

    catalogueTextStore.set(initializedTexts);
    
</script>

<div part="lens-catalogue">
    {#if toggle.collapsable}
        <button part="lens-catalogue-toggle-button" on:click={handleToggle}
            >{$catalogueTextStore.collapseButtonTitle}</button
        >
    {/if}
    {#if toggle.open}
        {#if toggle.animated}
            <div
                part="lens-catalogue-wrapper"
                transition:slide={{ duration: 300 }}
            >
                {#each treeData as Category}
                    <DataTreeElement open={toggle.open} element={Category} />
                {/each}
            </div>
        {:else}
            <div part="lens-catalogue-wrapper">
                {#each treeData as Category}
                    <DataTreeElement element={Category} />
                {/each}
            </div>
        {/if}
    {/if}
</div>
