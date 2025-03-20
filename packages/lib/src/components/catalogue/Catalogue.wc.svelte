<svelte:options
    customElement={{
        tag: "lens-catalogue",
    }}
/>

<script lang="ts">
    import { run } from "svelte/legacy";

    import { catalogueTextStore } from "../../stores/texts";
    import { catalogue } from "../../stores/catalogue";
    import type { ToggleAttribute } from "../../types/helpers";
    import type { CatalogueText } from "../../types/texts";
    import type { Catalogue } from "../../types/catalogue";
    import DataTreeElement from "./DataTreeElement.svelte";

    interface Props {
        // TODO: check if anyone actually uses this, otherwise remove it
        treeData?: Catalogue;

        texts?: CatalogueText;
        addIconUrl?: string | null;
        toggleIconUrl?: string | null;
        infoIconUrl?: string | null;
        /**
         * handle the toggle of the catalogue
         */
        toggle?: ToggleAttribute;
    }

    let {
        treeData = [],
        texts = {},
        toggle = {
            collapsable: true,
            open: false,
        },
    }: Props = $props();

    let toggleTree = $state(toggle.open);

    const handleToggle = (): void => {
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
    /**
     * Initialize the catalogue store with the given tree data
     * watch for changes from other components
     */
    run(() => {
        if (treeData.length !== 0) {
            $catalogue = treeData;
        }
    });
    /**
     * Initialize the text store with the given texts
     */
    run(() => {
        $catalogueTextStore = initializedTexts;
    });
</script>

<div part="lens-catalogue">
    {#if toggle.collapsable}
        <button
            part="lens-catalogue-toggle-button {toggle.open
                ? 'lens-catalogue-button-open'
                : ''}"
            onclick={handleToggle}
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
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each $catalogue as Category}
                <DataTreeElement element={Category} treeOpen={toggle.open} />
            {/each}
        </div>
    {/if}
</div>
