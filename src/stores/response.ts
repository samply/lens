import { writable } from "svelte/store";
import type { FhirMeasureReport } from "../types/response";

export const siteResults = writable(new Map<string, LensResult>());

/**
 * This store contains the sites that have responded and their status.
 *
 * If the site has started processing the beam task, it will be marked as "claimed",
 * and if a result is available, it will be marked as "succeeded".
 */
export const siteStatus = writable(new Map<string, "claimed" | "succeeded">());

/**
 * Site result contains the stratum counts for each stratifier (e.g gender) in the `stratifiers` field
 * and the total count of patients, samples, etc. in the `totals` field.
 *
 * Example:
 *
 * ```
 * {
 *     "stratifiers": {
 *         "gender": {
 *             "female": 31,
 *             "male": 43
 *         },
 *         "diagnosis": {
 *             "C34.0": 26,
 *             "C34.2": 28,
 *             "C34.8": 25
 *         },
 *     },
 *     "totals": {
 *         "patients": 74,
 *         "samples": 312
 *     }
 * }
 * ```
 */
export type LensResult = {
    stratifiers: Record<string, Record<string, number>>;
    totals: Record<string, number>;
};

/**
 * Call this when you receive a site result via beam.
 */
export function setSiteResult(site: string, result: LensResult) {
    // This check was useful during the transition to the new result format
    // to prevent the siteResults store from being set with the old format.
    if ("resourceType" in result) {
        throw new Error(
            "setSiteResult expects a LensResult, not a FhirMeasureReport",
        );
    }

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

/** Call this to hide a failed site from the results. */
export function hideFailedSite(site: string) {
    siteStatus.update((sites) => {
        sites.delete(site);
        return sites;
    });
    // Usually this is not necessary, as a failed site would not have a result.
    // But in case an application first calls setSiteResult and then
    // later decides to hide the site, we also remove the result here.
    siteResults.update((results) => {
        results.delete(site);
        return results;
    });
}

export function measureReportToLensResult(
    measureReport: FhirMeasureReport,
): LensResult {
    const result: LensResult = {
        stratifiers: {},
        totals: {},
    };
    for (const group of measureReport.group) {
        const measureCode = group.code.text;
        // Get total count
        if (group.population && group.population.length > 0) {
            result.totals[measureCode] = group.population[0].count;
        }
        // Get stratum counts
        for (const stratifier of group.stratifier) {
            const stratifierName = stratifier.code[0].text;
            if (!result.stratifiers[stratifierName]) {
                result.stratifiers[stratifierName] = {};
            }
            if (stratifier.stratum) {
                for (const stratum of stratifier.stratum) {
                    const stratumName = stratum.value.text;
                    if (stratum.population && stratum.population.length > 0) {
                        result.stratifiers[stratifierName][stratumName] =
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
export function getTotal(
    siteResults: Map<string, LensResult>,
    code: string,
): number {
    let total = 0;
    for (const siteResult of siteResults.values()) {
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
 * getSiteTotal($siteResults, 'berlin', 'patients'); // total number of patients in berlin
 * ```
 */
export function getSiteTotal(
    siteResults: Map<string, LensResult>,
    site: string,
    code: string,
): number {
    return siteResults.get(site)?.totals[code] ?? 0;
}

/**
 * Get a stratum count across all sites.
 *
 * Example usage:
 *
 * ```ts
 * getStratum($siteResults, 'gender', 'female'); // number of females across all sites
 * ```
 */
export function getStratum(
    siteResults: Map<string, LensResult>,
    stratifier: string,
    stratum: string,
): number {
    let total = 0;
    for (const siteResult of siteResults.values()) {
        total += siteResult.stratifiers[stratifier]?.[stratum] ?? 0;
    }
    return total;
}

/**
 * Get a stratum count for a specific site.
 *
 * Example usage:
 *
 * ```ts
 * getSiteStratum($siteResults, 'berlin', 'gender', 'female'); // number of females in berlin
 * ```
 */
export function getSiteStratum(
    siteResults: Map<string, LensResult>,
    site: string,
    stratifier: string,
    stratumCode: string,
): number {
    return siteResults.get(site)?.stratifiers[stratifier]?.[stratumCode] ?? 0;
}

/**
 * For a given stratifier, get all possible stratum codes across all sites.
 *
 * Example usage:
 *
 * ```ts
 * getStrata($siteResults, 'gender'); // example return value: ['female', 'male', 'other']
 * ```
 */
export function getStrata(
    siteResults: Map<string, LensResult>,
    code: string,
): string[] {
    const strataSet = new Set<string>();
    for (const siteResult of siteResults.values()) {
        if (siteResult.stratifiers[code]) {
            Object.keys(siteResult.stratifiers[code]).forEach((stratum) =>
                strataSet.add(stratum),
            );
        }
    }
    return Array.from(strataSet);
}
