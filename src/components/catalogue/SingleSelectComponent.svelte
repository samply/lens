<script lang="ts">
    import type { SingleSelectCategory } from "../../types/catalogue";
    import SingleSelectItemComponent from "./SingleSelectItemComponent.svelte";

    interface Props {
        element: SingleSelectCategory;
    }

    let { element }: Props = $props();
</script>

<div part="lens-single-select-wrapper">
    <!-- eslint-disable-next-line svelte/require-each-key -->
    {#each element.criteria as criterion}
        <SingleSelectItemComponent {element} {criterion} />
    {/each}
</div>

<style>
    [part~="lens-single-select-wrapper"] {
        display: grid;
        grid-template-columns: 1fr max-content max-content;
        column-gap: 10px;
        row-gap: 4px;
        align-items: center;
    }
</style>
