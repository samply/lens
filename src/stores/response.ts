import { writable, get } from "svelte/store";
import type { Site, SiteData } from "../types/response";
import type { ResponseStore } from "../types/backend";

export const responseStore = writable<ResponseStore>(new Map<string, Site>());

/**
 * updates the response store with a given response
 * @param response - the response to update the store with
 */
export const updateResponseStore = (response: ResponseStore): void => {
    let store: ResponseStore;
    responseStore.subscribe((s: ResponseStore) => (store = s));

    const changes = new Map<string, Site>();

    response.forEach((value, key) => {
        if (store.get(key)?.status === response.get(key)?.status) {
            return;
        }
        changes.set(key, value);
    });

    if (changes.size === 0) {
        return;
    }

    responseStore.update((store: ResponseStore): ResponseStore => {
        changes.forEach((value, key) => {
            store.set(key, value);
        });
        return store;
    });
};

/*
 * clear the response store
 */
export const clearResponseStore = () => {
    responseStore.set(new Map<string, Site>());
};

/**
 * @param store - the response store
 * @param code - the code to search for
 * @returns the aggregated population count for a given code
 */
export const getAggregatedPopulation = (code: string): number => {
    let population = 0;
    for (const site of get(responseStore).values()) {
        if (site.status === "succeeded") {
            population += getSitePopulationForCode(site.data, code);
        }
    }
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
    let population = 0;
    for (const group of site.group) {
        if (group.code.text === code) {
            population += group.population[0].count;
        }
    }
    return population;
};

/**
 * @param store - the response store
 * @param stratumCode - the code to search for
 * @param stratifier - the stratifier code to define where the stratumCode should be searched
 * @returns the aggregated population count for a given stratum code
 * (stratum code is the value.text of a stratum item e.g.'male')
 */
export const getAggregatedPopulationForStratumCode = (
    stratumCode: string,
    stratifier: string,
): number => {
    let population = 0;
    for (const site of get(responseStore).values()) {
        if (site.status === "succeeded") {
            population += getSitePopulationForStratumCode(
                site.data,
                stratumCode,
                stratifier,
            );
        }
    }
    return population;
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
    for (const group of site.group) {
        for (const stratifierItem of group.stratifier) {
            if (
                stratifierItem.code[0].text === stratifier &&
                stratifierItem.stratum !== undefined
            ) {
                for (const stratumItem of stratifierItem.stratum) {
                    if (
                        stratumItem.value.text === stratumCode &&
                        stratumItem.population !== undefined
                    ) {
                        return stratumItem.population[0].count;
                    }
                }
            }
        }
    }
    return 0;
};

/**
 * @param store - the response store
 * @param code - the code to search for
 * @returns the stratifier codes for a given group code
 */
export const getStratifierCodesForGroupCode = (code: string): string[] => {
    const codes: Set<string> = new Set();
    for (const site of get(responseStore).values()) {
        if (site.status === "succeeded") {
            const siteCodes = getSiteStratifierCodesForGroupCode(
                site.data,
                code,
            );
            for (const code of siteCodes) {
                codes.add(code);
            }
        }
    }
    return Array.from(codes);
};

/**
 * @param site - data of the responding site
 * @param code - the code to search for
 * @returns the stratifier codes for a given group code for a single site
 */

const getSiteStratifierCodesForGroupCode = (
    site: SiteData,
    code: string,
): string[] => {
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
