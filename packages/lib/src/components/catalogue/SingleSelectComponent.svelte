<script lang="ts">
    import type { SingleSelectCategory } from "../../types/catalogue";
    import SingleSelectItemComponent from "./SingleSelectItemComponent.svelte";

    export let element: SingleSelectCategory;
</script>

<div part="criterion-wrapper single-select-wrapper">
    {#each element.criteria as criterion}
        <SingleSelectItemComponent {element} {criterion} />
    {/each}
</div>
