import {  writable } from "svelte/store";
import type { Site, Stratum } from "../types/response";


export const responseStore = writable([

]);



/**
 * @param store the response store
 * @param code the code to search for
 * @returns the aggregated population count for a given code
 */
export const getAggregatedPopulation = (store: Site[], code: string): number => {
    let population = 0;
    if (store.length === 0 || store[0] === undefined) return 0;

    store.forEach((site) => {
        population += getSitePopulationForCode(site, code);
    })
}

/**
 * @param site the responding site
 * @param code the code to search for
 * @returns the population count for a given code at a given site
 */
export const getSitePopulationForCode = (site: Site, code: string): number => {
    let population = 0;
    site.value.group.forEach((group) => {
        if (group.code.text === code) {
            population += group.population[0].count;
        }
    })
    return population;
}

/**
 * @param store the response store
 * @param code the code to search for
 * @returns the population for a given stratum code for a given site
 */
export const getSiteStratifierForStratumCode = (site: Site, code: string, subCode: string): Stratum[] => {
    let stratifier: Stratum[] = [];
    console.log(site);

    site.value.group.forEach((group) => {
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








