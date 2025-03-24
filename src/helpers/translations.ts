import { get } from "svelte/store";
import type { Texts } from "../types/options";
import { lensOptions } from "../stores/options";

/** Translate a key into a human readable text. */
export function translate(key: string): string {
    const options = get(lensOptions);
    const language = options?.language ?? "en";
    const texts = options?.texts ?? {};
    return texts[key]?.[language] ?? lensTranslations[key]?.[language] ?? key;
}

const lensTranslations: Texts = {
    loading: {
        en: "Loading...",
        de: "Lädt...",
    },
    network_error: {
        en: "An error occurred while trying to connect to the network.",
        de: "Beim Verbinden mit dem Netzwerk ist ein Fehler aufgetreten.",
    },
    negotiate_error: {
        en: "The negotiator returned an error response.",
        de: "Der Negotiator hat einen Fehler zurückgegeben.",
    },
    add_all: {
        en: "Add all",
        de: "Alle hinzufügen",
    },
};
