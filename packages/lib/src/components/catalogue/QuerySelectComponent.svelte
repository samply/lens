<script lang="ts">
    import {
        addItemToQuery,
        queryStore,
        removeValueFromQuery,
    } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";

    /**
     * index: index of the group in the query store
     */
    export let index: number;
    export let queryItem: QueryItem;
    export let isChecked: boolean = false;
    /**
     * watch changes in the queryItem
     */
    $: {
        queryItem = queryItem;
    }

    /**
     * adds and removes items from the query store within the group
     */
    const toggleSelectedGroup = (checked): void => {
        if (checked) {
            addItemToQuery(queryItem, index);
        } else {
            removeValueFromQuery(queryItem, index);
        }
        isChecked = !isChecked;
    };

    /**
     * change isChecked when query store changes
     */
    $: {
        isChecked =
            $queryStore[index].find((item: QueryItem) =>
                item.values.find(
                    (value: QueryValue) =>
                        value.queryBindId === queryItem.values[0].queryBindId
                )
            ) !== undefined;
    }
</script>

<label part="query-selection-label">
    {index + 1}
    <input
        part="query-selection-input"
        type="checkbox"
        on:change={(e) => toggleSelectedGroup(!isChecked)}
        checked={isChecked}
    />
</label>
