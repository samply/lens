<script lang="ts">
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";
    import SingleSelectComponent from "./SingleSelectComponent.svelte";

    export let element: Category;

    const isSuperCategory = "childCategories" in element;

    export let open = true;
    let childOpen = open;
    const toggleChildren = () => {
        childOpen = !childOpen;
    };
</script>

<div part="data-tree-element">
    <button part="data-tree-element-name" on:click={toggleChildren}
        >{element.name}</button
    >
    {#if childOpen}
        {#if isSuperCategory}
            {#each element.childCategories as child}
                <div part="data-tree-element-child-category">
                    <DataTreeElement open={open} element={child} />
                </div>
            {/each}
        {:else}
            <div part="data-tree-element-last-child-options">
                {#if element.type === "single-select" && "criteria" in element}
                    <SingleSelectComponent {element} />
                {:else if element.type === "autocomplete" && "criteria" in element}
                    <AutocompleteComponent {element} />
                {:else if element.type === "number"}
                    <NumberInputComponent {element} />
                {/if}
            </div>
        {/if}
    {/if}
</div>
