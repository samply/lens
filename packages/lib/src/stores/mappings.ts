import { writable } from "svelte/store";

export const uiSiteMappingsStore = writable<Map<string,string>>(new Map());

export const siteToDefaultCollectionIdStore= writable<Map<string,string>>(new Map());