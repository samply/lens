import { writable, get } from "svelte/store";
import type { SiteData } from "../types/response";
import type { ResponseStore } from "../types/backend";

// This is not exported so we can change the type without touching other files.
// I would suggest to keep it private unless it becomes a larger inconvenience.
const siteResults = writable(new Map<string, SiteResult>());

/**
 * This store contains the sites that have responded and their status.
 *
 * If the site has started processing the beam task, it will be marked as "claimed",
 * and if a result is available, it will be marked as "succeeded".
 */
export const siteStatus = writable(new Map<string, "claimed" | "succeeded">());

/**
 * Site results contain the stratum counts for each stratifier (e.g gender)
 * and the total count of patients, samples, etc. in the `totals` field.
 *
 * Example:
 *
 * ```
 * {
 *     "gender": {
 *         "female": 31,
 *         "male": 43
 *     },
 *     "diagnosis": {
 *         "C34.0": 26,
 *         "C34.2": 28,
 *         "C34.8": 25
 *     },
 *     "totals": {
 *         "patients": 74,
 *         "samples": 312
 *     }
 * }
 * ```
 */
type SiteResult = {
    totals: Record<string, number>;
    [stratifier: string]: Record<string, number>;
};

/**
 * Call this when you receive a site result via beam.
 */
export function setSiteResult(site: string, result: SiteResult) {
    siteResults.update((results) => {
        results.set(site, result);
        return results;
    });
    siteStatus.update((status) => {
        status.set(site, "succeeded");
        return status;
    });
}

/**
 * Call this to indicate that the beam task has been claimed and a result will be available soon.
 */
export function markSiteClaimed(site: string) {
    siteStatus.update((sites) => {
        sites.set(site, "claimed");
        return sites;
    });
}

/**
 * Legacy function to update the response store.
 *
 * Prefer to use {@link setSiteResult} and {@link markSiteClaimed} instead.
 */
export function legacyUpdateResponseStore(response: ResponseStore): void {
    for (const [site, siteData] of response.entries()) {
        if (siteData.status === "claimed") {
            markSiteClaimed(site);
        } else if (siteData.status === "succeeded") {
            console.log(fhirToSiteResult(siteData.data));
            setSiteResult(site, fhirToSiteResult(siteData.data));
        }
    }
}

function fhirToSiteResult(siteData: SiteData): SiteResult {
    const result: SiteResult = {
        totals: {},
    };
    for (const group of siteData.group) {
        const measureCode = group.code.text;
        // Get total count
        if (group.population && group.population.length > 0) {
            result.totals[measureCode] = group.population[0].count;
        }
        // Get stratum counts
        for (const stratifier of group.stratifier) {
            const stratifierName = stratifier.code[0].text;
            if (!result[stratifierName]) {
                result[stratifierName] = {};
            }
            if (stratifier.stratum) {
                for (const stratum of stratifier.stratum) {
                    const stratumName = stratum.value.text;
                    if (stratum.population && stratum.population.length > 0) {
                        result[stratifierName][stratumName] =
                            stratum.population[0].count;
                    }
                }
            }
        }
    }
    return result;
}

/*
 * Clear all site results.
 */
export function clearSiteResults() {
    siteResults.set(new Map());
    siteStatus.set(new Map());
}

/**
 * Get a total count across all sites.
 *
 * Example usage:
 *
 * ```ts
 * getTotal('patients'); // total number of patients across all sites
 * ```
 */
export function getTotal(code: string): number {
    let total = 0;
    for (const siteResult of get(siteResults).values()) {
        total += siteResult.totals[code] ?? 0;
    }
    return total;
}

/**
 * Get a total count from a specific site.
 *
 * Example usage:
 *
 * ```ts
 * getSiteTotal('berlin', 'patients'); // total number of patients in berlin
 * ```
 */
export function getSiteTotal(site: string, code: string): number {
    return get(siteResults).get(site)?.totals[code] ?? 0;
}

/**
 * Get a stratum count across all sites.
 *
 * Example usage:
 *
 * ```ts
 * getStratum('gender', 'female'); // number of females across all sites
 * ```
 */
export function getStratum(stratifier: string, stratum: string): number {
    let total = 0;
    for (const siteResult of get(siteResults).values()) {
        total += siteResult[stratifier]?.[stratum] ?? 0;
    }
    return total;
}

/**
 * Get a stratum count for a specific site.
 *
 * Example usage:
 *
 * ```ts
 * getSiteStratum('berlin', 'gender', 'female'); // number of females in berlin
 * ```
 */
export function getSiteStratum(
    site: string,
    stratifier: string,
    stratumCode: string,
): number {
    return get(siteResults).get(site)?.[stratifier]?.[stratumCode] ?? 0;
}

/**
 * For a given stratifier, get all possible stratum codes across all sites.
 *
 * Example usage:
 *
 * ```ts
 * getStrata('gender'); // example return value: ['female', 'male', 'other']
 * ```
 */
export function getStrata(code: string): string[] {
    const strataSet = new Set<string>();
    for (const siteResult of get(siteResults).values()) {
        if (siteResult[code]) {
            Object.keys(siteResult[code]).forEach((stratum) =>
                strataSet.add(stratum),
            );
        }
    }
    return Array.from(strataSet);
}
