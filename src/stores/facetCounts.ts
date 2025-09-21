import { writable, get } from "svelte/store";
import { lensOptions } from "./options";
import { getCriteria } from "../stores/catalogue";
import type { FacetCounts } from "../types/facetCounts";

/**
 * Facet counts store: stratifier -> stratum -> number
 * Example: { gender: { male: 123, female: 456 } }
 */
export const facetCounts = writable<FacetCounts>({});

/**
 * Fetch facet counts from the backend and update the facetCounts store.
 * - Uses the provided backend URL
 * - POSTs to /criteria with { sites: [...] }
 * - Strips group from response, stores stratifier -> stratum -> number
 */
export async function fetchFacetCounts(spotUrl: string) {
    const url = spotUrl.replace(/\/$/, "") + "/prism/criteria";
    // If sites are not defined, we don't send them and Spot determines the sites to query
    const sites = get(lensOptions)?.sitesToQuery;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sites }),
        });
        if (!response.ok) {
            console.error(
                "Failed to fetch facet counts",
                response.status,
                response.statusText,
            );
            return;
        }
        const data: Record<
            string,
            Record<string, number>
        > = await response.json();
        // For the diagnosis stratum, add new stratifiers <prefix>.% that add up all <prefix> and <prefix>.<something>
        if (data["diagnosis"]) {
            const diagnoses = data["diagnosis"];
            const inCatalogue = new Set(getCriteria("diagnosis"));
            for (const [diagnosis, count] of Object.entries(diagnoses)) {
                if (!inCatalogue.has(diagnosis)) continue; // Skip if not in catalogue
                const prefix = diagnosis.split(".")[0];
                const wildcard = `${prefix}.%`;
                diagnoses[wildcard] = (diagnoses[wildcard] || 0) + count;
            }
        }
        facetCounts.set(data);
    } catch (e) {
        console.error("Error fetching facet counts", e);
    }
}

/**
 * Set the FacetCount Store.
 */
export function setFacetCounts(facet: FacetCounts) {
    facetCounts.set(facet);
}
