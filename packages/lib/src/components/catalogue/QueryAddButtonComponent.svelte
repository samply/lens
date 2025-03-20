<script lang="ts">
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import type { QueryItem } from "../../types/queryData";
    import { lensOptions } from "../../stores/options";

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
    {#if $lensOptions?.iconOptions?.addIconUrl}
        <img
            part="query-add-button-icon"
            src={$lensOptions?.iconOptions?.addIconUrl}
            alt="add icon"
        />
    {:else}
        &#8594;
    {/if}
</button>
