<svelte:options
    customElement={{
        tag: "lens-catalogue",
        props: {
            treeData: { type: "Object" },
            texts: { type: "Object" },
        },
    }}
/>

<script lang="ts">
    import { catalogueTextStore } from "../../stores/texts";
    import type { CatalogueText } from "../../types/texts";
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";

    export let treeData: Category[] = [];
    export let texts: CatalogueText = {
        group: "Group",
        numberInput: {
            labelFrom: "From",
            labelTo: "to",
            warning: `"from" cannot be higher than "to"`,
        },
    };

    catalogueTextStore.set(texts);
</script>

<div class="lens-catalogue-wrapper">
    {#each treeData as Category}
        <DataTreeElement element={Category} />
    {/each}
</div>
