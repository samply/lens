<svelte:options
    customElement={{
        tag: "lens-catalogue",
    }}
/>

<script lang="ts">
    import { catalogue } from "../../stores/catalogue";
    import type { Catalogue } from "../../types/catalogue";
    import DataTreeElement from "./DataTreeElement.svelte";
    import { onMount } from "svelte";
    import { lensOptions } from "../../stores/options";
    import { fetchFacetCounts } from "../../stores/facetCounts";
    import { translate } from "../../helpers/translations";

    interface Props {
        treeData?: Catalogue;
        /**
         * handle the toggle of the catalogue
         */
        toggle?: {
            collapsable?: boolean;
            open?: boolean;
        };
    }

    let {
        treeData = [],
        toggle = {
            collapsable: true,
            open: false,
        },
    }: Props = $props();

    let isOpen = $state(toggle.open);

    const handleToggle = (): void => {
        isOpen = !isOpen;
    };

    /**
     * Initialize the catalogue store with the given tree data
     * watch for changes from other components
     */
    $effect(() => {
        if (treeData.length !== 0) {
            $catalogue = treeData;
        }
    });

    onMount(() => {
        let didRun = false;
        lensOptions.subscribe((opts) => {
            if (opts !== undefined && !didRun) {
                if (opts.facetCount) {
                    fetchFacetCounts(opts.facetCount.backendUrl);
                    didRun = true;
                }
            }
        });
    });
</script>

<div part="lens-catalogue">
    {#if toggle.collapsable}
        <button
            part="lens-catalogue-toggle-button {isOpen
                ? 'lens-catalogue-button-open'
                : ''}"
            onclick={handleToggle}
        >
            <div
                part="toggle-button-icon {isOpen
                    ? ''
                    : 'lens-catalogue-toggle-button-closed-icon'}"
            >
                &#9660;
            </div>
            <div
                part="toggle-button-text {isOpen
                    ? 'toggle-button-open-text'
                    : ''}"
            >
                {isOpen
                    ? translate("catalogue_collapse")
                    : translate("catalogue_expand")}
            </div>
        </button>
    {/if}
    {#if isOpen || !toggle.collapsable}
        <div part="lens-catalogue-wrapper">
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each $catalogue as Category}
                <DataTreeElement element={Category} treeOpen={isOpen} />
            {/each}
        </div>
    {/if}
</div>

<style>
    [part~="lens-catalogue-toggle-button"] {
        background-color: var(--button-background-color);
        color: var(--button-color);
        border: none;
        border-radius: var(--border-radius-small);
        padding: var(--gap-xs) var(--gap-s);
        margin-bottom: var(--gap-s);
        font-size: var(--font-size-m);
        cursor: pointer;
        display: flex;
        gap: var(--gap-xs);
        width: 100%;
    }

    [part~="lens-catalogue-toggle-button"]:hover {
        background-color: var(--button-background-color-hover);
    }

    [part~="lens-catalogue-toggle-button-closed-icon"] {
        transform: rotate(180deg);
    }

    /**
  * Catalogue shared
  */

    [part~="lens-catalogue-wrapper"] {
        display: grid;
        grid-gap: var(--gap-xs);
    }
</style>
