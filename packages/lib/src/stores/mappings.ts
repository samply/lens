import { writable } from "svelte/store";

export const siteToDefaultCollectionIdStore = writable<Map<string, string>>(
    new Map(),
);
