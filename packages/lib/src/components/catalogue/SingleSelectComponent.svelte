<script lang="ts">
    import { iconStore } from "../../stores/icons";
    import { addItemToQuery } from "../../stores/query";
    import type { QueryItem } from "../../types/queryData";
    import type { Category } from "../../types/treeData";
    import SingleSelectItemComponent from "./SingleSelectItemComponent.svelte";
    import { v4 as uuidv4 } from "uuid";
    import { activeQueryGroupIndex } from "../../stores/query";

    export let element: Category;
    export let subgrouping: boolean = false;

    let index: number;

    $: index = $activeQueryGroupIndex;

    const addAll = (): void => {
        if (!("criteria" in element)) return;
        element.criteria.forEach((criterion) => {
            const queryItem: QueryItem = {
                id: uuidv4(),
                key: element.key,
                name: element.name,
                type: "type" in element && element.type,
                values: [
                    {
                        name: criterion.name,
                        value:
                            "aggregatedValue" in criterion
                                ? criterion.aggregatedValue
                                : criterion.key,
                        queryBindId: uuidv4(),
                    },
                ],
            };
            addItemToQuery(queryItem, 0);
        });
    };
</script>

<div part="criterion-wrapper single-select-wrapper">
    {#if "criteria" in element}
        {#if subgrouping && element.criteria.length > 1}
            <div part="criterion-section criterion-section-values">
                <span part="criterion-single-select-name">
                    alle hinzufügen
                </span>
            </div>
            <button part="query-add-button" on:click={addAll}>
                {#if $iconStore.get("addIconUrl")}
                    <img
                        part="query-add-button-icon"
                        src={$iconStore.get("addIconUrl")}
                        alt="add icon"
                    />
                {:else}
                    &#8594;
                {/if}
            </button>
        {/if}
        {#each element.criteria as criterion}
            <SingleSelectItemComponent {element} {criterion} />
        {/each}
    {/if}
</div>
