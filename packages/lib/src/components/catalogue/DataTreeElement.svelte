<script lang="ts">
    import type { Category } from "../../types/treeData";
    import DataTreeElement from "./DataTreeElement.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";
    import SingleSelectComponent from "./SingleSelectComponent.svelte";
    import { v4 as uuidv4 } from "uuid";
    import { activeNumberInputs, openTreeNodes } from "../../stores/catalogue";
    import type { QueryItem } from "../../types/queryData";
    import { iconStore } from "../../stores/icons";

    export let element: Category;

    /**
     * defines the layer of the element in the tree
     */
    export let layer: number = 1;

    /**
     * defines if the subcategorys are open, iterates over the whole tree
     */
    export let treeOpen: boolean = false;

    if (treeOpen) {
        openTreeNodes.update((store: string[]): string[] => {
            store = [...store, element.key];
            return store;
        });
    }

    /**
     * toggles the open state of the subcategorys
     */
    $: open = $openTreeNodes.includes(element.key);

    const toggleChildren = () => {
        openTreeNodes.update((store: string[]): string[] => {
            if (store.includes(element.key)) {
                return store.filter(
                    (item: string): Boolean => item !== element.key
                );
            } else {
                return [...store, element.key];
            }
        });
    };

    /**
     * watches the number input store to update the number input components
     */
    $: numberInput = $activeNumberInputs.find(
        (item) => item.key === element.key
    );

    /**
     * adds the number input to the store if it is not already in the store
     * @param store
     * @returns updated store
     */
    activeNumberInputs.update((store: QueryItem[]): QueryItem[] => {
        if (
            "fieldType" in element &&
            element.fieldType === "number" &&
            !store.find((item) => item.key === element.key)
        ) {
            return [
                ...store,
                {
                    id: uuidv4(),
                    key: element.key,
                    name: element.name,
                    system: "system" in element ? element.system : "",
                    type: "type" in element ? element.type : "",
                    values: [
                        {
                            name: "0",
                            value: { min: 0, max: 0 },
                            queryBindId: uuidv4(),
                        },
                    ],
                },
            ];
        }
        return store;
    });

    /**
     * adds a new number input component
     * not needed for the moment.
     */
    const addNumberInput = () => {
        activeNumberInputs.update((store: QueryItem[]): QueryItem[] => {
            store.forEach((item: QueryItem) => {
                if (item.key === element.key) {
                    item.values = [
                        ...item.values,
                        {
                            name: "0",
                            value: { min: 0, max: 0 },
                            queryBindId: uuidv4(),
                        },
                    ];
                }
            });
            return store;
        });
    };


</script>

<div part="data-tree-element">
    <button part="data-tree-element-name" on:click={toggleChildren}>
        {#if $iconStore.get('toggleIconUrl')}
            <img
                part="data-tree-element-toggle-icon {open
                    ? 'data-tree-element-toggle-icon-open'
                    : ''}"
                src={$iconStore.get('toggleIconUrl')}
                alt="catalogue-open-close-icon"
            />
        {:else}
            <span
                part="data-tree-element-toggle-icon {open
                    ? 'data-tree-element-toggle-icon-open'
                    : ''}"
            >
                &#8964
            </span>
        {/if}
        {element.name}
    </button>
    {#if open}
        {#if "childCategories" in element}
            {#each element.childCategories as child}
                <div
                    part={`data-tree-element-child-category data-tree-element-child-category-layer-${layer}`}
                >
                    <DataTreeElement
                        layer={layer + 1}
                        element={child}
                        {treeOpen}
                    />
                </div>
            {/each}
        {:else}
            <div part="data-tree-element-last-child-options">
                {#if "fieldType" in element && element.fieldType === "single-select"}
                    <SingleSelectComponent {element} />
                {:else if "fieldType" in element && element.fieldType === "autocomplete"}
                    <AutocompleteComponent {element} />
                {:else if "fieldType" in element && element.fieldType === "number"}
                    {#each numberInput.values as numberInputValues (numberInputValues.queryBindId)}
                        <NumberInputComponent
                            queryItem={{
                                ...numberInput,
                                values: [numberInputValues],
                            }}
                        />
                    {/each}
                    <!-- not needed for the moment. 
                        maybe turn on over config, if the needs of the projects differ in the future
                    -->
                    <!-- <div part="number-input-add">
                        <button
                            part="number-input-add-button"
                            on:click={() => addNumberInput()}
                        >
                            &plus;
                        </button>
                    </div> -->
                {/if}
            </div>
        {/if}
    {/if}
</div>
