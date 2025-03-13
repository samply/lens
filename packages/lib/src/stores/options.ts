import { writable } from "svelte/store";
import type { LensOptions } from "../types/options";

// This is undefined when the app starts up and gets populated when the options
// are fetched via the network.
export const lensOptions = writable<LensOptions | undefined>();

export function setOptions(options: LensOptions) {
    lensOptions.set(options);
}
