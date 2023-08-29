<script lang="ts">
    import { onMount } from "svelte";
    import {
        addItemToQuery,
        queryStore,
        removeItemFromQuery,
    } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";

    export let index: number;
    export let queryItem: QueryItem;
    /**
     * watch changes in the queryItem
     */
    $: {
        queryItem = queryItem;
    }

    /**
     * adds and removes items from the query store within the group
     */
    let isChecked = false;

    const toggleSelectedGroup = (checked): void => {
        if (checked) {
            addItemToQuery(queryItem, index);
        } else {
            removeItemFromQuery(queryItem, index);
        }
        isChecked = !isChecked;
    };

    onMount(() => {
        if (index === 0) {
            isChecked = true;
        }
    });

    /**
     * TODO: change checked state when query store changes
    */
</script>

<label part="lens-catalogue-query-select-label">
    {index + 1}
    <input
        part="lens-catalogue-query-select-input"
        type="checkbox"
        on:change={(e) => toggleSelectedGroup(!isChecked)}
        checked={isChecked}
    />
</label>
