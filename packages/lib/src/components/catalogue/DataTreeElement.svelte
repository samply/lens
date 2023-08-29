<script lang="ts">
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";
    import SingleSelectComponent from "./SingleSelectComponent.svelte";

    export let element: Category

    const isSuperCategory = 'childCategories' in element

</script>

<div part="data-tree-element">
    {#if isSuperCategory }
        <div>{element.name}</div>
        {#each element.childCategories as child}
            <DataTreeElement element={child} />
        {/each}
    {:else}
        <div>{element.name}</div>
        {#if element.type === 'single-select' && 'criteria' in element}
                <SingleSelectComponent {element} />
        {:else if element.type === 'autocomplete' && 'criteria' in element}
                <AutocompleteComponent {element} />
        {:else if element.type === 'number'}
                <NumberInputComponent {element} />
        {/if}
    {/if}
</div>
