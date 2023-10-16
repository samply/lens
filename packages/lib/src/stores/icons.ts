import { writable } from "svelte/store";


export const iconStore = writable<Map<string, string>>(new Map());