<script lang="ts">
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";
    import SingleSelectComponent from "./SingleSelectComponent.svelte";

    export let element: Category;

    const isSuperCategory: boolean = "childCategories" in element;

    export let layer: number = 1;
    export let open: boolean = true;
    let childOpen: boolean = open;
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
                <div
                    part={`data-tree-element-child-category data-tree-element-child-category-layer-${layer}`}
                >
                    <DataTreeElement layer={layer + 1} {open} element={child} />
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
