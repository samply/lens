import { writable } from "svelte/store";
import type { Biobank } from "../types/biobanks";

export const negotiateStore = writable<Biobank[]>([]);