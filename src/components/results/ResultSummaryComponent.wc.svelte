<svelte:options
    customElement={{
        tag: "lens-result-summary",
    }}
/>

<script lang="ts">
    import { lensOptions } from "../../stores/options";
    import {
        responseStore,
        getAggregatedPopulation,
        getAggregatedPopulationForStratumCode,
    } from "../../stores/response";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import type { HeaderData } from "../../types/options";

    // This is derived from lensOptions and from responseStore
    const populations: { title: string; population: string }[] = $derived.by(
        () => {
            // Show empty header when lens options are not loaded yet
            if ($lensOptions === undefined) {
                return [];
            }

            const populations = [];
            if ($lensOptions?.resultSummaryOptions?.dataTypes !== undefined) {
                for (const type of $lensOptions.resultSummaryOptions
                    .dataTypes) {
                    populations.push({
                        title: type.title,
                        population: getPopulation(type),
                    });
                }
            }
            return populations;
        },
    );

    /**
     * Get the count to display in the result summary header.
     * @param type An element of the "dataTypes" array from the lens options
     * @returns This is the text that is displayed after the colon, e.g. "Standorte: 13 / 15"
     */
    function getPopulation(type: HeaderData): string {
        // If the type is collections, the population is the length of the store
        if (type.dataKey === "collections") {
            let sitesClaimed = 0;
            let sitesWithData = 0;
            for (const site of $responseStore.values()) {
                if (site.status === "claimed" || site.status === "succeeded") {
                    sitesClaimed++;
                }
                if (site.status === "succeeded") {
                    sitesWithData++;
                }
            }
            return `${sitesWithData} / ${sitesClaimed}`;
        }

        // if the type has only one dataKey, the population is the aggregated population of that dataKey
        if (type.dataKey) {
            return getAggregatedPopulation(type.dataKey).toString();
        }

        // if the type has multiple dataKeys to aggregate, the population is the aggregated population of all dataKeys
        let aggregatedPopulation: number = 0;
        type.aggregatedDataKeys?.forEach((dataKey) => {
            if (dataKey.groupCode) {
                aggregatedPopulation += getAggregatedPopulation(
                    dataKey.groupCode,
                );
            } else if (dataKey.stratifierCode && dataKey.stratumCode) {
                aggregatedPopulation += getAggregatedPopulationForStratumCode(
                    dataKey.stratumCode,
                    dataKey.stratifierCode,
                );
            }
            /**
             * TODO: add support for stratifiers if needed?
             * needs to be implemented in response.ts
             */
        });
        return aggregatedPopulation.toString();
    }
</script>

<div part="lens-result-summary">
    {#if $lensOptions?.resultSummaryOptions?.title !== undefined}
        <div part="result-summary-header">
            <div part="heading">
                <h4 part="result-summary-header-title">
                    {$lensOptions?.resultSummaryOptions.title}
                    {#if $lensOptions?.resultSummaryOptions.infoButtonText !== undefined}
                        <InfoButtonComponent
                            message={[
                                $lensOptions?.resultSummaryOptions
                                    .infoButtonText,
                            ]}
                        />
                    {/if}
                </h4>
            </div>
        </div>
    {/if}
    <div part="result-summary-content">
        <!-- eslint-disable-next-line svelte/require-each-key -->
        {#each populations as population}
            <div part="result-summary-content-type">
                {population.title}: {population.population}
            </div>
        {/each}
    </div>
</div>

<style>
    [part~="lens-result-summary"] {
        display: grid;
        grid-template-columns: auto 1fr auto;
        grid-gap: var(--gap-xl);
        grid-column: 1/-1;
        align-items: center;
    }

    [part~="result-summary-content"] {
        display: flex;
        align-items: center;
        justify-content: space-around;
        gap: 10px;
    }
</style>
