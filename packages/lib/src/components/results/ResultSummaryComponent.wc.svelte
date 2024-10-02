<svelte:options
    customElement={{
        tag: "lens-result-summary",
    }}
/>

<script lang="ts">
    import { lensOptions } from "../../stores/options";
    import type { LensOptions } from "../../types/options";
    import {
        responseStore,
        getAggregatedPopulation,
        getAggregatedPopulationForStratumCode,
    } from "../../stores/response";
    import type { ResponseStore } from "../../types/backend";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import type { Site } from "../../types/response";
    import type { HeaderData } from "../../types/biobanks";

    type ResultSummaryDataType = HeaderData & { population?: string | number };

    let options: LensOptions & { infoButtonText?: string };
    $: options = $lensOptions?.resultSummaryOptions as LensOptions & {
        infoButtonText?: string;
    };

    let dataTypes: ResultSummaryDataType[];
    $: dataTypes = options?.dataTypes as ResultSummaryDataType[];

    let resultSummaryDataTypes: ResultSummaryDataType[];
    $: resultSummaryDataTypes = dataTypes || [];

    /**
     * Extracts the population for each result summary data type and adds it to the type object
     * @param store - the response store
     */
    const fillPopulationToSummaryTypes = (store: ResponseStore): void => {
        if (!dataTypes) {
            return;
        }

        /**
         * show the number of sites with data and the number of sites claimed/succeeded
         * like this: 2 / 3
         */
        let sitesClaimed: number = 0;
        let sitesWithData: number = 0;
        store.forEach((site: Site): void => {
            if (site.status === "claimed" || site.status === "succeeded") {
                sitesClaimed++;
            }
            if (site.status === "succeeded") {
                sitesWithData++;
            }
        });

        resultSummaryDataTypes = dataTypes.map(
            (type: ResultSummaryDataType): ResultSummaryDataType => {
                /**
                 * If the type is collections, the population is the length of the store
                 */
                if (type.dataKey === "collections") {
                    type.population = `${sitesWithData} / ${sitesClaimed}`;
                    return type;
                }

                /**
                 * if the type has only one dataKey, the population is the aggregated population of that dataKey
                 */

                if (type.dataKey) {
                    type.population = getAggregatedPopulation(
                        store,
                        type.dataKey,
                    );
                    return type;
                }

                /**
                 * if the type has multiple dataKeys to aggregate, the population is the aggregated population of all dataKeys
                 */

                let aggregatedPopulation: number = 0;

                type.aggregatedDataKeys?.forEach((dataKey) => {
                    if (dataKey.groupCode) {
                        aggregatedPopulation += getAggregatedPopulation(
                            store,
                            dataKey.groupCode,
                        );
                    } else if (dataKey.stratifierCode && dataKey.stratumCode) {
                        aggregatedPopulation +=
                            getAggregatedPopulationForStratumCode(
                                store,
                                dataKey.stratumCode,
                                dataKey.stratifierCode,
                            );
                    }
                    /**
                     * TODO: add support for stratifiers if needed?
                     * needs to be implemented in response.ts
                     */
                });

                type.population = aggregatedPopulation;
                return type;
            },
        );
    };

    $: fillPopulationToSummaryTypes($responseStore);
</script>

{#if options?.title}
    <div part="result-summary-header">
        <div part="heading">
            <h4 part="result-summary-header-title">
                {options.title}
                {#if options.infoButtonText}
                    <InfoButtonComponent message={[options.infoButtonText]} />
                {/if}
            </h4>
        </div>
    </div>
{/if}
<div part="result-summary-content">
    {#each resultSummaryDataTypes as type}
        <div part="result-summary-content-type">
            {type.title}: {type.population || 0}
        </div>
    {/each}
</div>
