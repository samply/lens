<script lang="ts">
    import { onDestroy } from "svelte";
    import { v4 as uuidv4 } from "uuid";
    import type { SingleSelectCategory, Criteria } from "../../types/catalogue";
    import AddButton from "./AddButton.svelte";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";
    import { facetCounts } from "../../stores/facetCounts";
    import { lensOptions } from "../../stores/options";
    import { revealedCriterion } from "../../stores/catalogue";

    interface Props {
        element: SingleSelectCategory;
        criterion: Criteria;
    }

    let { element, criterion }: Props = $props();

    let nameElement: HTMLElement | undefined = $state();
    let revealed: boolean = $state(false);
    let revealTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

    /**
     * scrolls to the criterion and highlights it when the catalogue filter reveals it
     */
    $effect(() => {
        const target = $revealedCriterion;
        if (
            target === null ||
            target.categoryKey !== element.key ||
            target.criterionKey !== criterion.key ||
            nameElement === undefined
        ) {
            return;
        }

        nameElement.scrollIntoView({ block: "center", behavior: "smooth" });
        revealed = true;
        clearTimeout(revealTimeout);
        revealTimeout = setTimeout(() => (revealed = false), 2000);
    });

    onDestroy(() => clearTimeout(revealTimeout));

    function onclick() {
        addItemToQuery(
            {
                id: uuidv4(),
                key: element.key,
                name: element.name,
                type: element.type,
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

{#if criterion.description}
    <abbr
        bind:this={nameElement}
        part="lens-singleselect-item-underline {revealed
            ? 'lens-singleselect-item-revealed'
            : ''}"
        title={criterion.description}>{criterion.name}</abbr
    >
{:else}
    <span
        bind:this={nameElement}
        part="lens-singleselect-item-name {revealed
            ? 'lens-singleselect-item-revealed'
            : ''}">{criterion.name}</span
    >
{/if}
{#if $facetCounts[element.key] !== undefined}
    <span
        part="lens-single-select-facet-count"
        title={$lensOptions?.facetCount?.hoverText?.[element.key] ?? ""}
    >
        {$facetCounts[element.key][criterion.key] ?? 0}
    </span>
{:else}
    <span></span>
{/if}
<AddButton inSearchBar={false} {onclick} />

<style>
    [part~="lens-single-select-facet-count"] {
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

    [part~="lens-singleselect-item-revealed"] {
        border-radius: var(--border-radius-small);
        animation: reveal-criterion 2s ease-out;
    }

    @keyframes reveal-criterion {
        0%,
        50% {
            background-color: var(--light-gray);
            box-shadow: 0 0 0 2px var(--blue);
        }
        100% {
            background-color: transparent;
            box-shadow: none;
        }
    }
</style>
