<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import type { SingleSelectCategory, Criteria } from "../../types/catalogue";
    import AddButton from "./AddButton.svelte";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { facetCounts } from "../../stores/facetCounts";
    import { lensOptions } from "../../stores/options";

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

{#if criterion.description != ""}
    <abbr part="lens-singleselect-item-underline" title={criterion.description}
        >{criterion.name}</abbr
    >
{:else}
    <span>{criterion.name}</span>
{/if}
{#if $facetCounts[element.key] !== undefined}
    <span
        part="single-select-facet-count"
        title={$lensOptions?.facetCount?.hoverText?.[element.key] ?? ""}
    >
        {$facetCounts[element.key][criterion.key] ?? 0}
    </span>
{:else}
    <span></span>
{/if}
<AddButton {onclick} />

<style>
    [part~="single-select-facet-count"] {
        color: #636363;
        font-size: 0.95em;
        justify-self: right;
        background-color: rgb(239, 239, 252);
        padding: 1px 6px;
        border-radius: 40px;
    }
    [part~="lens-singleselect-item-underline"] {
        cursor: help;
    }
</style>
