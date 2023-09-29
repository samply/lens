import {  writable } from "svelte/store";
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
 * @param site data of the responding site
 * @param code the code to search for
 * @returns the population for a given stratum code for a given site
 */
export const getSiteStratifierForStratumCode = (site: SiteData, code: string, subCode: string): Stratum[] => {

    let stratifier: Stratum[] = [];

    site.group.forEach((group) => {
        if (group.code.text === code) {
            console.log(group);
            group.stratifier.forEach((stratifierItem) => {
                if (stratifierItem.code[0].text === subCode) {
                    stratifierItem.stratum?.forEach((stratumItem) => {
                        if ('stratum' in stratifierItem) {
                            stratifier.push({
                                code: stratumItem.value.text,
                                population: stratumItem.population[0].count
                            })
                        } else {
                            stratifier.push({
                                code: stratumItem.value.text,
                            })
                        }
                    })
                }
            })
        }
    })

    return stratifier;
}








