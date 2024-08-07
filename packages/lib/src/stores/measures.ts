import { writable } from "svelte/store";
import type { MeasureStore } from "../types/backend";

/**
 * Store to hold the measures
 * populated by the search button
 */

export const measureStore = writable<MeasureStore>();
