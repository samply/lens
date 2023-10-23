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
    import { catalogue } from "../../stores/catalogue";
    import type { ToggleAttribute } from "../../types/helpers";
    import type { CatalogueText } from "../../types/texts";
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import { iconStore } from "../../stores/icons";

    export let treeData: Category[] = [];
    export let texts: CatalogueText = {};
    export let addIconUrl: string | null = null;
    export let toggleIconUrl: string | null = null;
    export let infoIconUrl: string | null = null;

    iconStore.update((store: Map<string,string>) => {
        if (addIconUrl) {
            store.set('addIconUrl', addIconUrl);
        }
        if (toggleIconUrl) {
            store.set('toggleIconUrl', toggleIconUrl);
        }
        if (infoIconUrl) {
            store.set('infoIconUrl', infoIconUrl);
        }
        return store;
    })

      /**
     * Initialize the catalogue store with the given tree data
     * watch for changes from other components
     */
     $: $catalogue = treeData;

    /**
     * Initialize the text store with the given texts
     */
    $: $catalogueTextStore = initializedTexts;

    /**
     * handle the toggle of the catalogue
     */
    export let toggle: ToggleAttribute = {
        collapsable: true,
        open: false,
    };
    
    let toggleTree = toggle.open;

    const handleToggle = () => {
        toggleTree = !toggleTree;
    };

    /**
     * Initialize the catalogue text store with the given texts
     */
    let initializedTexts = {
        group: texts.group || "Group",
        collapseButtonTitle: texts.collapseButtonTitle || "Collapse Tree",
        expandButtonTitle: texts.expandButtonTitle || "Expand Tree",
        numberInput: {
            labelFrom: texts.numberInput?.labelFrom || "From",
            labelTo: texts.numberInput?.labelTo || "to",
        },
    };

  
</script>

<div part="lens-catalogue">
    {#if toggle.collapsable}
        <button
            part="lens-catalogue-toggle-button {toggle.open
                ? 'lens-catalogue-button-open'
                : ''}"
            on:click={handleToggle}
        >
            <div
                part="toggle-button-icon {toggle.open
                    ? 'toggle-button-open-icon'
                    : ''}"
            >
                &#9660;
            </div>
            <div
                part="toggle-button-text {toggle.open
                    ? 'toggle-button-open-text'
                    : ''}"
            >
                {toggle.open
                    ? $catalogueTextStore.collapseButtonTitle
                    : $catalogueTextStore.expandButtonTitle}
            </div>
        </button>
    {/if}
    {#if toggleTree || !toggle.collapsable}
        <div part="lens-catalogue-wrapper">
            {#each $catalogue as Category}
                <DataTreeElement element={Category} treeOpen={toggle.open} />
            {/each}
        </div>
    {/if}
</div>
