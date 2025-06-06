import { writable, get } from "svelte/store";
import { lensOptions } from "./options";
import { getCriteria } from "../stores/catalogue";

/**
 * Facet counts store: stratifier -> stratum -> number
 * Example: { gender: { male: 123, female: 456 } }
 */
export const facetCounts = writable<Record<string, Record<string, number>>>({});

/**
 * Fetch facet counts from the backend and update the facetCounts store.
 * - Uses the provided backend URL
 * - POSTs to /criteria with { sites: [...] }
 * - Strips group from response, stores stratifier -> stratum -> number
 */
export async function fetchFacetCounts(backendURL: string) {
    const url = backendURL.replace(/\/$/, "") + "/criteria";
    const options = get(lensOptions);
    // Try to get sites from siteMappings, fallback to empty array
    const sites = Object.keys(options?.siteMappings || {});
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
        const data = await response.json();
        console.log("[facetCounts] response:", data);
        // Flatten: group -> stratifier -> stratum -> number  => stratifier -> stratum -> number
        const flat: Record<string, Record<string, number>> = {};
        for (const group of Object.values(data)) {
            for (const [stratifier, stratumObj] of Object.entries(
                group as object,
            )) {
                if (!flat[stratifier]) flat[stratifier] = {};
                for (const [stratum, count] of Object.entries(
                    stratumObj as object,
                )) {
                    flat[stratifier][stratum] = count as number;
                }
            }
        }
        // For the diagnosis stratum, add new stratifiers <prefix>.% that add up all <prefix> and <prefix>.<something>
        if (flat["diagnosis"]) {
            const diagnoses = flat["diagnosis"];
            const inCatalogue = new Set(getCriteria("diagnosis"));
            for (const [diagnosis, count] of Object.entries(diagnoses)) {
                if (!inCatalogue.has(diagnosis)) continue; // Skip if not in catalogue
                const prefix = diagnosis.split(".")[0];
                const wildcard = `${prefix}.%`;
                diagnoses[wildcard] = (diagnoses[wildcard] || 0) + count;
            }
        }
        facetCounts.set(flat);
        console.log("[facetCounts] updated:", flat);
    } catch (e) {
        console.error("Error fetching facet counts", e);
    }
}
