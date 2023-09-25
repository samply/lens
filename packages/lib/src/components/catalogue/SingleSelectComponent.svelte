<script lang="ts">
    import type { Category } from "../../types/treeData";
    import SingleSelectItemComponent from "./SingleSelectItemComponent.svelte";

    export let element: Category;
</script>

<div part="criterion-wrapper single-select-wrapper">
    {#if "criteria" in element}
        {#each element.criteria as criterion}
           <SingleSelectItemComponent {element} {criterion} />
        {/each}
    {/if}
</div>
