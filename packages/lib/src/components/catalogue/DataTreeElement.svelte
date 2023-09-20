<script lang="ts">
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";
    import SingleSelectComponent from "./SingleSelectComponent.svelte";
    import { onMount } from "svelte";
    import { v4 as uuidv4 } from "uuid";
    import type { QueryItem } from "../../types/queryData";
    import { writable } from "svelte/store";

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
    
     let numberInputs = [
        {
            id: uuidv4(),
            key: element.key,
            name: element.name,
            type: 'type' in element ? element.type : '',
            system: 'system' in element ? element.system : '',
            values: [{name: "", value: {min: 0, max: 0}, queryBindId: uuidv4()}],
        },
    ]

    /**
     * adds a new number input component
     */
    const addNumberInput = () => {
        numberInputs = [
            ...numberInputs,
            {
                id: uuidv4(),
                key: element.key,
                name: element.name,
                type: 'type' in element ? element.type : '',
                system: 'system' in element ? element.system : '',
                values: [{name: "", value: {min: 0, max: 0}, queryBindId: uuidv4()}],
            },
        ]
    };

    /**
     * deletes a number input component
     */
    const deleteNumberInput = (queryBindId: string) => {
        numberInputs = numberInputs.filter(item => item.values[0].queryBindId !== queryBindId)
    };

    // const numberInputs = writable( [
    //     {
    //         id: uuidv4(),
    //         key: element.key,
    //         name: element.name,
    //         type: 'type' in element ? element.type : '',
    //         system: 'system' in element ? element.system : '',
    //         values: [{name: "", value: {min: 0, max: 0}, queryBindId: uuidv4()}],
    //     },
    // ])

    // /**
    //  * adds a new number input component
    //  */
    // const addNumberInput = () => {
    //     numberInputs.update(store => {
    //         const inputs = [
    //             ...store,
    //             {
    //                 id: uuidv4(),
    //                 key: element.key,
    //                 name: element.name,
    //                 type: 'type' in element ? element.type : '',
    //                 system: 'system' in element ? element.system : '',
    //                 values: [{name: "", value: {min: 0, max: 0}, queryBindId: uuidv4()}],
    //             },
    //         ]
    //         return inputs
    //     })
    // };

    // /**
    //  * deletes a number input component
    //  */
    // const deleteNumberInput = (queryBindId: string) => {
    //     //filter the store and remove the number input component with the given queryBindId
    //     numberInputs.update(store => {
    //         console.log(store)
    //         const inputs = store.filter(item => item.values[0].queryBindId !== queryBindId)
    //         return inputs
    //     })
    // };
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
                {#if "fieldType" in element && element.fieldType === "single-select"}
                    <SingleSelectComponent {element} />
                {:else if "fieldType" in element && element.fieldType === "autocomplete"}
                    <AutocompleteComponent {element} />
                {:else if "fieldType" in element && element.fieldType === "number"}
                <div>{JSON.stringify(numberInputs.map(item => item.values[0].queryBindId))}</div>
                    {#each numberInputs as numberInputComponent (numberInputComponent.values[0].queryBindId)}))}
                        <NumberInputComponent
                            queryItem={numberInputComponent} deleteNumberInput={deleteNumberInput}
                        />
                    {/each}
                    <div part="number-input-add">
                        <button
                            part="number-input-add-button"
                            on:click={() => addNumberInput()}
                        >
                            &plus;
                        </button>
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
</div>
