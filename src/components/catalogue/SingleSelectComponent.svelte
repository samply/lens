<script lang="ts">
    import type { SingleSelectCategory } from "../../types/catalogue";
    import SingleSelectItemComponent from "./SingleSelectItemComponent.svelte";

    interface Props {
        element: SingleSelectCategory;
    }

    let { element }: Props = $props();
</script>

<div part="criterion-wrapper single-select-wrapper">
    <!-- eslint-disable-next-line svelte/require-each-key -->
    {#each element.criteria as criterion}
        <SingleSelectItemComponent {element} {criterion} />
    {/each}
</div>
