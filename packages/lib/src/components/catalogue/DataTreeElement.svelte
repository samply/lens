<script lang="ts">
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";
    import SingleSelectComponent from "./SingleSelectComponent.svelte";
    import { queryStore, removeItemFromQuery } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import {numberInputComponents, addNumberInputComponent} from '../../stores/catalogue-inputs'
    import { onMount } from "svelte";
    import { v4 as uuidv4 } from "uuid";

    export let element: Category;

    const isSuperCategory: boolean = "childCategories" in element;

    /**
     * defines the layer of the element in the tree
     */
    export let layer: number = 1;

    /**
     * toggles the open state of the subcategorys
     */
    export let open: boolean = true;
    /**
     * toggles the open state of the values
     */
    let childOpen: boolean = open;

    const toggleChildren = () => {
        childOpen = !childOpen;
    };


    /**
     * initializes the frist number input component
    */
    onMount(() => {
        if (element.type === "number") {
            addNumberInputComponent(element.key, element.name)
        }
    })


    $: $numberInputComponents


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
                <div>
                    
                    {JSON.stringify($numberInputComponents.map((item) => item.queryBindId))}
                </div>
                    {#each $numberInputComponents as numberInputComponent}
                    {JSON.stringify(numberInputComponent.queryBindId)}
                    <NumberInputComponent
                        queryItem={{
                            id: uuidv4(),
                            key: element.key,
                            name: element.name,
                            values: [numberInputComponent]
                        }}
                        />
                    {/each}
                    <div part="number-input-add">
                        <button
                            part="number-input-add-button"
                            on:click={() => addNumberInputComponent(element.key, element.name)}
                        >
                            &plus;
                        </button>
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
</div>
