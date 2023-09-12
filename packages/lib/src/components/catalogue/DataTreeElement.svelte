<script lang="ts">
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";
    import SingleSelectComponent from "./SingleSelectComponent.svelte";
    import { queryStore } from "../../stores/query";
    import { v4 as uuidv4 } from "uuid";
    import type { QueryItem, QueryValue } from "../../types/queryData";

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
     * defines and handles the number inputs
     * numberInputComponents: array of uuids to identify the number input components
     */
    const numberGroupInternalId: string = uuidv4();

    let numberInputComponents = [uuidv4()];

    const addNumberInputComponent = (): void => {
        numberInputComponents = [...numberInputComponents, uuidv4()];
    };

    /**
     * removes the number input component from the list and erases the values from the query store
     * @param queryItem: the item which will be destroyed
     * @returns void
     */
    const handleRemoveElement = (queryItem: QueryItem): void => {
        queryStore.update((store) => {
            store.forEach((queryGroup: QueryItem[]) => {
                queryGroup.forEach((item: QueryItem) => {
                    if (item.id !== queryItem.id) {
                        return store;
                    }
                    item.values = item.values.filter(
                        (value: QueryValue) =>
                            value.queryBindId !==
                            queryItem.values[0].queryBindId
                    );
                });
            });
            return store;
        });

        numberInputComponents = numberInputComponents.filter(
            (componentId) => componentId !== queryItem.values[0].queryBindId
        );
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
                    {#each numberInputComponents as numberInputComponent}
                        <NumberInputComponent
                            {element}
                            queryGroupInternalId={numberGroupInternalId}
                            queryBindId={numberInputComponent}
                            {handleRemoveElement}
                        />
                    {/each}
                    <div part="number-input-add">
                        <button
                        part="number-input-add-button"
                        on:click={addNumberInputComponent}
                        >
                        &plus;
                    </button>
                </div>
                {/if}
            </div>
        {/if}
    {/if}
</div>
