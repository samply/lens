import { writable } from "svelte/store";
import type { MeasureStore } from "../types/backend";

/**
 * Store to hold the measures
 * populated by the search button
 */

export const measureStore = writable<MeasureStore>();

export function setMeasures(measures: MeasureStore) {
    measureStore.set(measures);
}
