<script lang="ts">

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

    const showTooltip = (): void => {
        waitingForTooltip = true;
        setTimeout(() => {
            if (waitingForTooltip) tooltipOpen = true;
        }, 400);
    };

    const hideTooltip = (): void => {
        waitingForTooltip = false;
        tooltipOpen = false;
    };
</script>

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
