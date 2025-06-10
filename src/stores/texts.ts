import { writable } from "svelte/store";
import type { CatalogueText } from "../types/texts";

export const catalogueTextStore = writable<CatalogueText>({});
