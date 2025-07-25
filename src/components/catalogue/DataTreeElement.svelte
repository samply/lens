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
    <div part="lens-data-tree-element-header">
        <button part="lens-data-tree-element-name" onclick={toggleChildren}>
            <div
                part="lens-data-tree-element-toggle-icon {open
                    ? 'lens-data-tree-element-toggle-icon-open'
                    : ''}"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"><path d="m9 18 6-6-6-6" /></svg
                >
            </div>
            {"subCategoryName" in element && element.subCategoryName
                ? element.subCategoryName
                : element.name}
        </button>
        {#if element.infoButtonText}
            <InfoButtonComponent
                message={element.infoButtonText}
                buttonSize="18px"
            />
        {/if}

        {#if "infoLink" in element && element.infoLink !== undefined}
            <a href={element.infoLink.link} target="_blank"
                >{element.infoLink.display}</a
            >
        {/if}

        {#if finalParent && open}
            <button
                part="lens-data-tree-add-all-options-button"
                onclick={selectAllOptions}
            >
                {translate("add_all")}
            </button>
        {/if}
    </div>

    {#if open}
        {#if "childCategories" in element}
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each element.childCategories as child}
                <div
                    part={`lens-data-tree-element-child-category lens-data-tree-element-child-category-layer-${layer}`}
                >
                    <DataTreeElement
                        layer={layer + 1}
                        element={child}
                        {treeOpen}
                    />
                </div>
            {/each}
        {:else}
            <div part="lens-data-tree-element-last-child-options">
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
    [part~="lens-data-tree-element-header"] {
        display: flex;
        gap: var(--gap-xs);
        align-items: center;
        margin-bottom: var(--gap-xxs);
    }

    [part~="lens-data-tree-element-name"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xxs);
        font-family: var(--font-family);
        color: var(--font-color);
        padding: 0;
        font-size: var(--font-size-m);
        border: none;
        background-color: unset;
        cursor: pointer;
    }

    [part~="lens-data-tree-element-toggle-icon"] {
        transform: rotate(0deg);
        transition: all 0.1s ease-in-out;
    }

    [part~="lens-data-tree-element-toggle-icon-open"] {
        transform: rotate(90deg);
    }

    [part~="data-tree-element-toggle-icon-open"] {
        transform: rotate(90deg);
    }

    [part~="lens-data-tree-add-all-options-button"] {
        background-color: var(--button-background-color);
        border-radius: var(--border-radius-small);
        color: var(--button-color);
        padding: 3px 8px;
        cursor: pointer;
        border: none;
    }

    [part~="lens-data-tree-element-child-category"] {
        padding: var(--gap-xs) 0 0 var(--gap-s);
        border-left: solid 1px var(--lightest-gray);
        margin-left: var(--gap-xs);
    }

    [part~="lens-data-tree-element-last-child-options"] {
        max-width: 100%;
        border-left: solid 1px var(--lightest-gray);
        margin-left: var(--gap-xs);
        padding-left: var(--gap-m);
        padding-top: var(--gap-xs);
        padding-bottom: var(--gap-xs);
    }
</style>
