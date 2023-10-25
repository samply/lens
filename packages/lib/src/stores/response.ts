import { writable } from "svelte/store";
import type { Site, SiteData, Status, Stratum } from "../types/response";
import type { ResponseStore } from "../types/backend";


export const responseStore = writable<ResponseStore>(
    new Map<string, Site>()
);

/**
 * @param store the response store
 * @param code the code to search for
 * @returns the aggregated population count for a given code
 */
export const getAggregatedPopulation = (store: ResponseStore, code: string): number => {
    if (store.size === 0) return 0;

    const sites: Site[] = Array.from(store.values());

    let population = 0;


    sites.forEach((site) => {
        if (site.data === null) return;
        population += getSitePopulationForCode(site.data, code);
    })

    return population;
}

/**
 * @param site data of the responding site
 * @param code the code to search for
 * @returns the population count for a given code at a given site
*/
export const getSitePopulationForCode = (site: SiteData, code: string): number => {

    let population = 0;
    if (!site) return;

    site.group.forEach((group) => {
        if (group.code.text === code) {
            population += group.population[0].count;
        }
    })
    return population;
}


/**
 * @param store the response store
 * @param code the code to search for
 * @returns the aggregated population count for a given stratum code
 */
export const getAggregatedStratifierForStratumCode = (store: ResponseStore, code: string): number => {

    const sites = Array.from(store.values());

    let population = 0;
    if (store.size === 0) return 0;

    sites.forEach((site) => {
        population += getSitePopulationForCode(site.data, code);
    })

    return population;
}


/**
 * @param store the response store
 * @param code the code to search for
 * @returns the aggregated population count for a given stratum code 
 * (stratum code is the value.text of a stratum item e.g.'male')
 */

export const getAggregatedPopulationForStratumCode = (store: ResponseStore, stratumCode: string, stratifier: string): number => {

    const sites = Array.from(store.values());

    let population = [];
    if (store.size === 0) return 1;

    sites.forEach((site) => {
        population.push(getSitePopulationForStratumCode(site.data, stratumCode, stratifier))
    })

    return population.reduce((a, b) => a + b, 0);
}


/**
 * @param site data of the responding site
 * @param code the code to search for
 * @returns the population for a given stratum code for a given site
 */
export const getSitePopulationForStratumCode = (site: SiteData, stratumCode: string, stratifier: string): number => {
    if (!site) return 0;

    let population = 0;

    site.group.forEach((group) => {
        group.stratifier.forEach((stratifierItem) => {
            if(stratifierItem.code[0].text !== stratifier) return;
            stratifierItem.stratum?.forEach((stratumItem) => {
                if (stratumItem.value.text === stratumCode) {
                    population = stratumItem.population[0].count;
                }
            })
        })
    })

    return population;
}


/**
 * @param store the response store
 * @param code the code to search for
 * @returns the stratifier codes for a given group code
 */
export const getStratifierCodesForGroupCode = (store: ResponseStore, code: string): string[] => {

    const sites = Array.from(store.values());

    let codes: Set<string> = new Set();
    if (store.size === 0) return [''];

    sites.forEach((site) => {
        let siteCodes = getSiteStratifierCodesForGroupCode(site.data, code);
        siteCodes.forEach((code) => {
            codes.add(code);
        })
    })

    let codesArray = Array.from(codes);
    return codesArray;
}

/**
 * @param site data of the responding site
 * @param code the code to search for
 * @returns the stratifier codes for a given group code for a single site
 */

export const getSiteStratifierCodesForGroupCode = (site: SiteData, code: string): string[] => {
    if (!site) return [''];
    let codes: string[] = [];

    site.group.forEach((groupItem) => {
        groupItem.stratifier.forEach(stratifierItem => {
            if (stratifierItem.code[0].text === code && stratifierItem.stratum) {
                stratifierItem.stratum.forEach((stratumItem) => {
                    codes.push(stratumItem.value.text);
                })
            }
        });
    })

    return codes;
}


