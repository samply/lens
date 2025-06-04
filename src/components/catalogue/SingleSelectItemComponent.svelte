<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import type { SingleSelectCategory, Criteria } from "../../types/catalogue";
    import AddButton from "./AddButton.svelte";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { facetCounts } from "../../stores/facetCounts";

    interface Props {
        element: SingleSelectCategory;
        criterion: Criteria;
    }

    let { element, criterion }: Props = $props();

    function onclick() {
        addItemToQuery(
            {
                id: uuidv4(),
                key: element.key,
                name: element.name,
                type: element.type,
                system: "system" in element ? element.system : "",
                values: [
                    {
                        name: criterion.name,
                        value:
                            criterion.aggregatedValue !== undefined
                                ? criterion.aggregatedValue
                                : criterion.key,
                        queryBindId: uuidv4(),
                    },
                ],
            },
            $activeQueryGroupIndex,
        );
    }
</script>

<span>{criterion.name}</span>
<span part="single-select-facet-count">
    {#if $facetCounts[element.key]?.[criterion.key] !== undefined}
        ({$facetCounts[element.key][criterion.key]})
    {/if}
</span>
<AddButton {onclick} />

<style>
    [part~="single-select-facet-count"] {
        margin-left: 0.5em;
        color: #888;
        font-size: 0.95em;
        justify-self: end;
    }
</style>
