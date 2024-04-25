import { writable } from "svelte/store";
import type { LensOptions } from "../types/options";

export const lensOptions = writable<LensOptions>({});
