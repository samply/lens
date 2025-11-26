<svelte:options
    customElement={{
        tag: "lens-result-summary",
    }}
/>

<script lang="ts">
    import { lensOptions } from "../../stores/options";
    import {
        siteStatus,
        getTotal,
        getStratum,
        type LensResult,
        siteResults,
    } from "../../stores/response";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import type { HeaderData } from "../../types/options";

    interface Props {
        /** Visually indicate that values are approximate (e.g., with a tilde). */
        indicateApproximation?: boolean;
    }
    let { indicateApproximation = false }: Props = $props();

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
                        population: getPopulation(type, $siteResults),
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
    function getPopulation(
        type: HeaderData,
        siteResults: Map<string, LensResult>,
    ): string {
        // If the type is collections, the population is the length of the store
        if (type.dataKey === "collections") {
            let sitesClaimed = 0;
            let sitesWithData = 0;
            for (const status of $siteStatus.values()) {
                if (status === "claimed" || status === "succeeded") {
                    sitesClaimed++;
                }
                if (status === "succeeded") {
                    sitesWithData++;
                }
            }
            return `${sitesWithData} / ${sitesClaimed}`;
        }

        let population: number;
        if (type.dataKey) {
            // if the type has only one dataKey, the population is the aggregated population of that dataKey
            population = getTotal(siteResults, type.dataKey);
        } else {
            // if the type has multiple dataKeys to aggregate, the population is the aggregated population of all dataKeys
            population = 0;
            type.aggregatedDataKeys?.forEach((dataKey) => {
                if (dataKey.groupCode) {
                    population += getTotal(siteResults, dataKey.groupCode);
                } else if (dataKey.stratifierCode && dataKey.stratumCode) {
                    population += getStratum(
                        siteResults,
                        dataKey.stratifierCode,
                        dataKey.stratumCode,
                    );
                }
                /**
                 * TODO: add support for stratifiers if needed?
                 * needs to be implemented in response.ts
                 */
            });
        }

        if (indicateApproximation) {
            return `≈ ${population}`;
        } else {
            return population.toString();
        }
    }
</script>

<div part="lens-result-summary">
    {#if $lensOptions?.resultSummaryOptions?.title !== undefined}
        <div part="lens-result-summary-header">
            <div part="lens-result-summary-heading">
                <h4 part="lens-result-summary-header-title">
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
    <div part="lens-result-summary-content">
        <!-- eslint-disable-next-line svelte/require-each-key -->
        {#each populations as population}
            <div part="lens-result-summary-content-type">
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

    [part~="lens-result-summary-content"] {
        display: flex;
        align-items: center;
        justify-content: space-around;
        gap: 10px;
    }

    [part~="lens-result-summary-header-title"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xs);
    }
</style>
