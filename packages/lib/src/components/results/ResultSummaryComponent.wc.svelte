<svelte:options
    customElement={{
        tag: "lens-result-summary",
        props: {
            resultSummaryDataTypes: { type: "Array" },
        },
    }}
/>

<script lang="ts">
    import {
        responseStore,
        getAggregatedPopulation,
    } from "../../stores/response";
    import NegotiateButtonComponent from "../buttons/NegotiateButtonComponent.wc.svelte";

    export let title: string = "";
    export let resultSummaryDataTypes: { key; title; population? }[] = [];
    export let negotiateButton: boolean = false;
    export let negotiateButtonText: string = "Negotiate";

    /**
     * Extracts the population for each result summary data type and adds it to the type object
     * @param store
     */
    const fillPopulationToSummaryTypes = (store): void => {
        
        if (store[0] === undefined) return;

        resultSummaryDataTypes = resultSummaryDataTypes.map((type) => {
            /**
             * If the type is sites, the population is the length of the store
             */
            if (type.key === "sites") {
                type.population = store.length;
                return type;
            }

            /**
             * otherwise, get the population from the store
             */
            type.population = getAggregatedPopulation(store, "patients");
            return type;
        });
        console.log(store[0].value.group);
    };

    $: fillPopulationToSummaryTypes($responseStore);
</script>

{#if title}
    <div part="result-summary-header">
        <h4 part="result-summary-header-title">
            {title}
        </h4>
    </div>
{/if}
<div part="result-summary-content">
    {#each resultSummaryDataTypes as type}
        <div part="result-summary-content-type">
            {type.title}: {type.population}
        </div>
    {/each}
</div>
{#if negotiateButton}
    <div part="result-summary-footer">
        <NegotiateButtonComponent title={negotiateButtonText} />
    </div>
{/if}
