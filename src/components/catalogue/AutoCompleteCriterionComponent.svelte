<script lang="ts">
    import type { QueryItem } from "../../types/queryData";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";

    interface Props {
        /**
         * the item which will be added to the query store
         */
        chosenOption: QueryItem;
    }

    let { chosenOption }: Props = $props();

    /**
     * Handles the tooltip behaviour
     */
    let waitingForTooltip: boolean = false;
    let tooltipOpen: boolean = $state(false);

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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
    part="criterion-autocomplete-name"
    onmouseenter={showTooltip}
    onmouseleave={hideTooltip}
>
    {chosenOption.values[0].name}
    <dialog part="criterion-autocomplete-tooltip" open={tooltipOpen}>
        {chosenOption.values[0].description}
    </dialog>
</span>
<QueryAddButtonComponent queryItem={chosenOption} />
