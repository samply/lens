<script lang="ts">
    import { addItemToQuery, activeQueryGroupIndex } from "../../stores/query";
    import type { Category } from "../../types/catalogue";
    import DataTreeElement from "./DataTreeElement.svelte";
    import NumberInputComponent from "./NumberInputComponent.svelte";
    import StringInputComponent from "./StringInputComponent.svelte";
    import AutocompleteComponent from "./AutoCompleteComponent.svelte";
    import SingleSelectComponent from "./SingleSelectComponent.svelte";
    import { v4 as uuidv4 } from "uuid";
    import { openTreeNodes } from "../../stores/catalogue";
    import type { QueryItem } from "../../types/queryData";
    import { lensOptions } from "../../stores/options";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import DatePickerComponent from "./DatePickerComponent.svelte";
    import { translate } from "../../helpers/translations";

    interface Props {
        element: Category;
        /**
         * defines the layer of the element in the tree
         */
        layer?: number;
        /**
         * defines if the subcategorys are open, iterates over the whole tree
         */
        treeOpen?: boolean;
    }

    let { element, layer = 1, treeOpen = false }: Props = $props();

    const subCategoryName: string | null =
        "subCategoryName" in element &&
        element.subCategoryName !== undefined &&
        element.subCategoryName !== null
            ? element.subCategoryName
            : null;

    if (treeOpen) {
        /**
         * DISCUSS: open all subcategorys on creation needed?
         */
    }

    /**
     * watches the open tree nodes store to update the open state of the subcategorys
     */
    let open = $derived.by(() => {
        if (subCategoryName) {
            return (
                $openTreeNodes
                    .get(element.key)!
                    .subCategoryNames?.includes(subCategoryName) || false
            );
        } else {
            return $openTreeNodes.get(element.key) ? true : false;
        }
    });

    /**
     * adds and removes the subcategorys from the open tree nodes store
     */
    const toggleChildren = (): void => {
        openTreeNodes.update((store) => {
            let storeTreeNode = store.get(element.key);

            if (!storeTreeNode) {
                store.set(element.key, {
                    key: element.key,
                    subCategoryNames: null,
                });
                return store;
            }

            if (subCategoryName === null) {
                store.delete(element.key);
                return store;
            }

            if (storeTreeNode.subCategoryNames === null) {
                storeTreeNode.subCategoryNames = [subCategoryName];
                store.set(element.key, storeTreeNode);
                return store;
            }

            if (storeTreeNode.subCategoryNames.includes(subCategoryName)) {
                storeTreeNode.subCategoryNames =
                    storeTreeNode.subCategoryNames.filter(
                        (name) => name !== subCategoryName,
                    );
                store.set(element.key, storeTreeNode);
                return store;
            }

            if (!storeTreeNode.subCategoryNames.includes(subCategoryName)) {
                storeTreeNode.subCategoryNames.push(subCategoryName);
                store.set(element.key, storeTreeNode);
                return store;
            }

            return store;
        });
    };

    let finalParent: boolean =
        !("childCategories" in element) &&
        (!("fieldType" in element) ||
            ("fieldType" in element &&
                typeof element.fieldType === "string" &&
                element.fieldType == "single-select"));

    const selectAllOptions = (): void => {
        if (!("criteria" in element)) return;

        element.criteria.forEach((criterion) => {
            const queryItem: QueryItem = {
                id: uuidv4(),
                key: element.key,
                name: element.name,
                system: "system" in element ? element.system : "",
                type: "type" in element ? element.type : "",
                values: [
                    {
                        name: criterion.name,
                        value: criterion.aggregatedValue
                            ? criterion.aggregatedValue
                            : criterion.key,
                        queryBindId: uuidv4(),
                    },
                ],
            };
            addItemToQuery(queryItem, $activeQueryGroupIndex);
        });
    };
</script>

<div part="data-tree-element">
    <button part="data-tree-element-name" onclick={toggleChildren}>
        {#if $lensOptions?.iconOptions?.toggleIconUrl}
            <img
                part="data-tree-element-toggle-icon {open
                    ? 'data-tree-element-toggle-icon-open'
                    : ''}"
                src={$lensOptions?.iconOptions?.toggleIconUrl}
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
        {"subCategoryName" in element && element.subCategoryName
            ? element.subCategoryName
            : element.name}
    </button>
    {#if element.infoButtonText}
        <InfoButtonComponent message={element.infoButtonText} />
    {/if}

    {#if "infoLink" in element && element.infoLink !== undefined}
        <a href={element.infoLink.link} target="_blank"
            >{element.infoLink.display}</a
        >
    {/if}

    {#if finalParent && open}
        <button part="add-all-options-button" onclick={selectAllOptions}>
            {translate("add_all")}
        </button>
    {/if}

    {#if open}
        {#if "childCategories" in element}
            <!-- eslint-disable-next-line svelte/require-each-key -->
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
                {#if element.fieldType === "single-select"}
                    <SingleSelectComponent {element} />
                {:else if element.fieldType === "autocomplete"}
                    <AutocompleteComponent {element} />
                {:else if element.fieldType === "number"}
                    <NumberInputComponent {element} />
                {:else if element.fieldType === "string"}
                    <StringInputComponent {element} />
                {:else if element.fieldType === "date"}
                    <DatePickerComponent {element} />
                {/if}
            </div>
        {/if}
    {/if}
</div>

<style>
    [part~="data-tree-element-info-icon"]:hover {
        display: block;
    }
    [part~="data-tree-element-info-text"]:hover {
        display: block;
    }

    [part~="data-tree-element-child-category"] {
        padding: var(--gap-xs) 0 0 var(--gap-s);
        border-left: solid 1px var(--lightest-gray);
    }

    [part~="data-tree-element-last-child-options"] {
        border-left: solid 1px var(--lightest-gray);
        padding-left: var(--gap-m);
        padding-top: var(--gap-xs);
        padding-bottom: var(--gap-xs);
    }
</style>
