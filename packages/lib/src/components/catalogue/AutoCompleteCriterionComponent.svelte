<script lang="ts">
    /**
     * TODO: allowing for checkboxes or add button
     */

    import type { Category, Criteria } from "../../types/treeData";
    import QuerySelectComponent from "./QuerySelectComponent.svelte";
    import { catalogueTextStore } from "../../stores/texts";
    import { queryStore } from "../../stores/query";
    import { v4 as uuidv4 } from "uuid";
    import type { QueryItem } from "../../types/queryData";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";

    /**
     * the item which will be added to the query store
     */
    export let chosenOption: QueryItem;

    /**
     * Handles the tooltip behaviour
     */
    let waitingForTooltip: boolean = false;
    let tooltipOpen: boolean = false;

    const showTooltip = () => {
        waitingForTooltip = true;
        setTimeout(() => {
            if (waitingForTooltip) tooltipOpen = true;
        }, 400);
    };

    const hideTooltip = () => {
        waitingForTooltip = false;
        tooltipOpen = false;
    };
</script>

<!-- <div part="criterion-item criterion-item-autocomplete"> -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
    part="criterion-autocomplete-name"
    on:mouseenter={showTooltip}
    on:mouseleave={hideTooltip}
>
    {chosenOption.values[0].name}
    <dialog part="criterion-autocomplete-tooltip" open={tooltipOpen}>
        {chosenOption.values[0].description}
    </dialog>
</span>
<QueryAddButtonComponent queryItem={chosenOption} />

<!-- <div part="criterion-section criterion-section-groups">
        <span part="criterion-group-label criterion-group-label-autocomplete"
            >{$catalogueTextStore.group}</span
        >
        <span
            part="criterion-group-wrapper criterion-group-wrapper-autocomplete"
        >
            {#each $queryStore as _, index}
                <QuerySelectComponent
                    {index}
                    isChecked={index === 0}
                    queryItem={chosenOption}
                />
            {/each}
        </span>
    </div> -->
<!-- </div> -->
