<script lang="ts">
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import CheckboxComponent from "./CheckboxComponent.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";

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
        {#if element.type === 'checkbox' && 'criteria' in element}
                <CheckboxComponent criteria={element.criteria} />
        {:else if element.type === 'autocomplete' && 'criteria' in element}
                <AutocompleteComponent criteria={element.criteria} />
        {:else if element.type === 'number'}
                <NumberInputComponent {element} />
        {/if}
    {/if}
</div>
