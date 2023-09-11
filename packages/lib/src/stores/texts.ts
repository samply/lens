import { writable } from "svelte/store";
import type { CatalogueText } from "../types/texts";

export const catalogueTextStore = writable<CatalogueText>({
    group: "Group",
    numberInput: {
        labelFrom: "From",
        labelTo: "to",
    }
});