<script lang="ts">
    import type { SelectElement } from "../../types/catalogue";
    import SingleSelectItemComponent from "./SingleSelectItemComponent.svelte";

    interface Props {
        element: SelectElement;
    }

    let { element }: Props = $props();
</script>

<div part="lens-single-select-wrapper">
    <!-- eslint-disable-next-line svelte/require-each-key -->
    {#each element.options as option}
        <SingleSelectItemComponent {element} {option} />
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
