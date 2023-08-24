<svelte:options
customElement={{
    tag: 'lens-catalogue',
    props: {
      treeData: { type: 'Object' }
    },
}} />


<script lang="ts">
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";

    export let treeData: Category[] = [];
</script>

<div class="lens-catalogue-wrapper">
    {#each treeData as Category}
        <DataTreeElement element={Category} />
    {/each}
</div>