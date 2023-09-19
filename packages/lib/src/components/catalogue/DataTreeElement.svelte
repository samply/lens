<script lang="ts">
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";
    import SingleSelectComponent from "./SingleSelectComponent.svelte";
    import {numberInputComponents, addNumberInputComponent} from '../../stores/catalogue-inputs'
    import { onMount } from "svelte";
    import { v4 as uuidv4 } from "uuid";

    export let element: Category;

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
        if ('fieldType' in element && element.fieldType === "number") {
            addNumberInputComponent(element.key, element.name)
        }
    })


    $: numberInput = $numberInputComponents


</script>

<div part="data-tree-element">
    <button part="data-tree-element-name" on:click={toggleChildren}
        >{element.name}</button
    >
    {#if childOpen}
        {#if "childCategories" in element}
            {#each element.childCategories as child}
                <div
                    part={`data-tree-element-child-category data-tree-element-child-category-layer-${layer}`}
                >
                    <DataTreeElement layer={layer + 1} {open} element={child} />
                </div>
            {/each}
        {:else}
            <div part="data-tree-element-last-child-options">
                {#if 'fieldType' in element && element.fieldType === "single-select"}
                    <SingleSelectComponent {element} />
                {:else if 'fieldType' in element &&  element.fieldType === "autocomplete"}
                    <AutocompleteComponent {element} />
                {:else if 'fieldType' in element &&  element.fieldType === "number"}
                <div>
                    
                    {JSON.stringify($numberInputComponents.map((item) => item.queryBindId))}
                </div>
                    {#each numberInput as numberInputComponent}
                    {JSON.stringify(numberInputComponent.queryBindId)}
                    <NumberInputComponent
                        queryItem={{
                            id: uuidv4(),
                            key: element.key,
                            name: element.name,
                            type: element.type,
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
