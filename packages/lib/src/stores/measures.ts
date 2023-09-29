import { writable } from 'svelte/store';    
import type { Measure } from '../types/backend';

/**
 * Store to hold the measures 
 * populated by the search button
 */

export const measureStore = writable<Measure[]>([]);