import { writable } from "svelte/store";
import type { Site, SiteData } from "../types/response";
import type { ResponseStore } from "../types/backend";

export const responseStore = writable<ResponseStore>(new Map<string, Site>());

/**
 * @param store - the response store
 * @param code - the code to search for
 * @returns the aggregated population count for a given code
 */
export const getAggregatedPopulation = (
    store: ResponseStore,
    code: string,
): number => {
    if (store.size === 0) return 0;

    const sites: Site[] = Array.from(store.values());

    let population: number = 0;

    sites.forEach((site: Site) => {
        if (site.data === null) return;
        population += getSitePopulationForCode(site.data, code);
    });

    return population;
};

/**
 * @param site - data of the responding site
 * @param code - the code to search for
 * @returns the population count for a given code at a given site
 */
export const getSitePopulationForCode = (
    site: SiteData,
    code: string,
): number => {
    let population: number = 0;
    if (!site) return population;

    site.group.forEach((group) => {
        if (group.code.text === code) {
            population += group.population[0].count;
        }
    });
    return population;
};

/**
 * @param store - the response store
 * @param code - the code to search for
 * @returns the aggregated population count for a given stratum code
 */
export const getAggregatedStratifierForStratumCode = (
    store: ResponseStore,
    code: string,
): number => {
    const sites: Site[] = Array.from(store.values());

    let population: number = 0;
    if (store.size === 0) return 0;

    sites.forEach((site) => {
        population += getSitePopulationForCode(site.data, code);
    });

    return population;
};

/**
 * @param store - the response store
 * @param code - the code to search for
 * @returns the aggregated population count for a given stratum code
 * (stratum code is the value.text of a stratum item e.g.'male')
 */

export const getAggregatedPopulationForStratumCode = (
    store: ResponseStore,
    stratumCode: string,
    stratifier: string,
): number => {
    const sites: Site[] = Array.from(store.values());

    const population: number[] = [];
    if (store.size === 0) return 1;

    sites.forEach((site: Site) => {
        population.push(
            getSitePopulationForStratumCode(site.data, stratumCode, stratifier),
        );
    });

    return population.reduce((a: number, b: number) => a + b, 0);
};

/**
 * @param site - data of the responding site
 * @param stratumCode - the code to search for
 * @param stratifier - the stratifier code to define where the stratumCode should be searched
 * @returns the population for a given stratum code for a given site
 */
export const getSitePopulationForStratumCode = (
    site: SiteData,
    stratumCode: string,
    stratifier: string,
): number => {
    if (!site) return 0;

    let population: number = 0;

    site.group.forEach((group) => {
        group.stratifier.forEach((stratifierItem) => {
            if (stratifierItem.code[0].text !== stratifier) return;
            stratifierItem.stratum?.forEach((stratumItem) => {
                if (
                    stratumItem.value.text === stratumCode &&
                    stratumItem.population !== undefined
                ) {
                    population = stratumItem.population[0].count;
                }
            });
        });
    });

    return population;
};

/**
 * @param site - data of the responding site
 * @param stratifier - the stratifier code to define where the stratumCode should be searched
 * @returns the number of elements in the stratifier for a given site
 */
export const getSitePopulationForStratifier = (
    site: SiteData,
    stratifier: string,
): number => {
    if (!site) return 0;

    let population: number = 0;

    site.group.forEach((group) => {
        group.stratifier.forEach((stratifierItem) => {
            if (stratifierItem.code[0].text !== stratifier) return;
            stratifierItem.stratum?.forEach((stratumItem) => {
                if (stratumItem.population !== undefined) {
                    population++;
                }
            });
        });
    });

    return population;
};

/**
 * @param store - the response store
 * @param code - the code to search for
 * @returns the stratifier codes for a given group code
 */
export const getStratifierCodesForGroupCode = (
    store: ResponseStore,
    code: string,
): string[] => {
    const sites: Site[] = Array.from(store.values());

    const codes: Set<string> = new Set();
    if (store.size === 0) return [""];

    sites.forEach((site: Site) => {
        const siteCodes: string[] = getSiteStratifierCodesForGroupCode(
            site.data,
            code,
        );
        siteCodes.forEach((code: string) => {
            codes.add(code);
        });
    });

    const codesArray = Array.from(codes);
    return codesArray;
};

/**
 * @param site - data of the responding site
 * @param code - the code to search for
 * @returns the stratifier codes for a given group code for a single site
 */

export const getSiteStratifierCodesForGroupCode = (
    site: SiteData,
    code: string,
): string[] => {
    if (!site) return [""];
    const codes: string[] = [];

    site.group.forEach((groupItem) => {
        groupItem.stratifier.forEach((stratifierItem) => {
            if (
                stratifierItem.code[0].text === code &&
                stratifierItem.stratum
            ) {
                stratifierItem.stratum.forEach((stratumItem) => {
                    codes.push(stratumItem.value.text);
                });
            }
        });
    });

    return codes;
};
