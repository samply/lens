import { writable, get } from "svelte/store";
import type { Site, SiteData } from "../types/response";
import type { ResponseStore } from "../types/backend";

export const responseStore = writable<ResponseStore>(new Map<string, Site>());
export const siteStatus = writable(new Map<string, "succeeded" | "claimed">());

/**
 * Legacy function to update the response store.
 */
export function legacyUpdateResponseStore(response: ResponseStore): void {
    let store: ResponseStore;
    responseStore.subscribe((s: ResponseStore) => (store = s));

    const changes = new Map<string, Site>();

    response.forEach((value, key) => {
        siteStatus.update((status) => {
            if (response.get(key)?.status === "succeeded") {
                status.set(key, "succeeded");
            } else if (response.get(key)?.status === "claimed") {
                status.set(key, "claimed");
            }
            return status;
        });

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
}

/*
 * Clear all site results.
 */
export function clearSiteResults() {
    responseStore.set(new Map<string, Site>());
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
    let population = 0;
    for (const [siteName, site] of get(responseStore).entries()) {
        if (site.status === "succeeded") {
            population += getSiteTotal(siteName, code);
        }
    }
    return population;
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
    // only if site is in the map and status is succeeded
    const siteData = get(responseStore).get(site);
    if (!siteData || siteData.status !== "succeeded") {
        return 0;
    }

    let population = 0;
    for (const group of siteData.data.group) {
        if (group.code.text === code) {
            population += group.population[0].count;
        }
    }
    return population;
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
    let population = 0;
    for (const [siteName, site] of get(responseStore).entries()) {
        if (site.status === "succeeded") {
            population += getSiteStratum(siteName, stratifier, stratum);
        }
    }
    return population;
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
    // only if site is in the map and status is succeeded
    const siteData = get(responseStore).get(site);
    if (!siteData || siteData.status !== "succeeded") {
        return 0;
    }

    for (const group of siteData.data.group) {
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
}
