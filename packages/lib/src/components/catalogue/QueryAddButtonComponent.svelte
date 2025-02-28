<script lang="ts">
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import type { QueryItem } from "../../types/queryData";
    import { iconStore } from "../../stores/icons";

    /**
     * index: index of the group in the query store
     */
    let index: number = $derived($activeQueryGroupIndex);

    interface Props {
        queryItem: QueryItem;
    }

    let { queryItem }: Props = $props();

    /**
     * adds the item to the query store within the focused group
     */
    const addItem = (): void => {
        addItemToQuery(queryItem, index);
    };
</script>

<button part="query-add-button" onclick={addItem}>
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
