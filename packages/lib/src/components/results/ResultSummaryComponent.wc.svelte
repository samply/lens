<svelte:options
    customElement={{
        tag: "lens-result-summary",
        props: {
            resultSummaryDataTypes: { type: "Array" },
        },
    }}
/>

<script lang="ts">
    import { lensOptions } from "../../stores/options";
    import {
        responseStore,
        getAggregatedPopulation,
        getAggregatedPopulationForStratumCode,
    } from "../../stores/response";
    import type { ResponseStore } from "../../types/backend";


    let options: any = {};
    $: options = $lensOptions.resultSummaryOptions

    let resultSummaryDataTypes: { key: string; title: string; population?: string | number }[]
    $: resultSummaryDataTypes = options?.dataTypes || [];

    
    /**
     * Extracts the population for each result summary data type and adds it to the type object
     * @param store
     */
    const fillPopulationToSummaryTypes = (store: ResponseStore): void => {
        if (!options?.dataTypes) {
            return;
        }
        console.log(store);
        
        /**
         * show the number of sites with data and the number of sites claimed/succeeded
         * like this: 2 / 3
         */
        let sitesClaimed: number = 0;
        let sitesWithData: number = 0;
        store.forEach((site) => {
            if (site.status === 'claimed' || site.status === 'succeeded') {
                sitesClaimed++;
            }
            if (site.status === 'succeeded') {
                sitesWithData++;
            }
        });

        resultSummaryDataTypes = options.dataTypes.map((type) => {
            console.log(getAggregatedPopulationForStratumCode(store, '1', "Histlogoies"));
            /**
             * If the type is collections, the population is the length of the store
             */
            if (type.dataKey === "collections") {
                type.population =`${sitesWithData} / ${sitesClaimed}`;
                return type;
            }

            /**
             * if the type has only one dataKey, the population is the aggregated population of that dataKey
             */

            if(type.dataKey) {
                type.population = getAggregatedPopulation(store, type.dataKey);
                return type;
            }

            /**
             * if the type has multiple dataKeys to aggregate, the population is the aggregated population of all dataKeys
             */

            let aggregatedPopulation: number = 0;

            type.aggregatedDataKeys.forEach((dataKey) => {
                if(dataKey.groupCode){
                    aggregatedPopulation += getAggregatedPopulation(store, dataKey.groupCode);
                } else if(dataKey.stratifierCode && dataKey.stratumCode) {
                    aggregatedPopulation += getAggregatedPopulationForStratumCode(store, dataKey.stratumCode, dataKey.stratifierCode);
                }
                /**
                 * TODO: add support for stratifiers if needed?
                 * needs to be implemented in response.ts
                */
            });

            type.population = aggregatedPopulation;
            return type;
        });
    };

    $: fillPopulationToSummaryTypes($responseStore);

</script>

{#if options?.title}
    <div part="result-summary-header">
        <h4 part="result-summary-header-title">
            {options.title}
        </h4>
    </div>
{/if}
<div part="result-summary-content">
    {#each resultSummaryDataTypes as type}
        <div part="result-summary-content-type">
            {type.title}: {type.population || 0}
        </div>
    {/each}
</div>

