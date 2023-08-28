<script lang="ts">
    import { queryStore } from "../../stores/query";
    import type { Category } from "../../types/treeData";
    import QuerySelectComponent from "./QuerySelectComponent.svelte";
    import { v4 as uuidv4 } from "uuid";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import { catalogueTextStore } from "../../stores/texts";

    export let element: Category;

    let from: number = 0;
    let to: number = 0;
    const queryGroupInternalId: string = uuidv4();
    /**
     * used to identify the value in the query store which has to update when 'from' or 'to' changes
     */
    const queryBindId: string = uuidv4();

    /**
     * update all groups in the store when from or to changes
     */
    $: queryStore.update((store) => {
        store.forEach((queryGroup: QueryItem[]) => {
            queryGroup.forEach((item: QueryItem) => {
                if (item.id !== queryGroupInternalId) {
                    return store;
                }
                item.values.forEach((queryValue: QueryValue) => {
                    if (queryValue.queryBindId === queryBindId) {
                        queryValue.name = `From ${from} to ${to}`;
                        queryValue.value = { min: from, max: to };
                    }
                });
            });
        });
        return store;
    });


    let queryItem: QueryItem
    $: queryItem = {
        id: queryGroupInternalId,
        key: element.key,
        name: element.name,
        values: [
            {
                name: `From ${from} to ${to}`,
                value: { min: from, max: to },
                queryBindId: queryBindId,
            },
        ],
    };

</script>

<div part="lens-number-input-wrapper">
    <div part="lens-number-input-section lens-number-input-section-values">
        <label
            part="lens-number-input-section-values-label lens-number-input-section-values-label-from"
        >
            {$catalogueTextStore.numberInput.labelFrom}
            <input
                part="lens-number-input-section-values-input lens-number-input-section-values-input-from"
                type="number"
                bind:value={from}
                min="0"
            />
        </label>

        <label
            part="lens-number-input-section-values-label lens-number-input-section-values-label-to"
        >
            {$catalogueTextStore.numberInput.labelTo}
            <input
                part="lens-number-input-section-values-input lens-number-input-section-values-input-to"
                type="number"
                bind:value={to}
                min="0"
            />
        </label>
    </div>
    <div part="lens-number-input-section lens-number-input-section-groups">
        <span part="lens-number-input-section-groups-label"
            >{$catalogueTextStore.group}</span
        >
        <span part="lens-number-input-section-groups-checkboxes">
            {#each $queryStore as _, index}
                <QuerySelectComponent
                    {index}
                    {queryItem}
                />
            {/each}
        </span>
    </div>
    {#if from > to}
        <div part="lens-number-input-warning">
            {$catalogueTextStore.numberInput.warning}
        </div>
    {/if}
</div>
