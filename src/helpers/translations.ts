import { get } from "svelte/store";
import type { Texts } from "../types/options";
import { lensOptions } from "../stores/options";

/**
 * @param key the key to translate
 * @returns the human readable text
 */
export function translate(key: string): string {
    const options = get(lensOptions);
    const language = options?.language ?? "en";
    const texts = options?.texts ?? {};
    return texts[key]?.[language] ?? lensTranslations[key]?.[language] ?? key;
}

const lensTranslations: Texts = {
    cannot_be_empty: {
        en: "Cannot be empty",
        de: "Darf nicht leer sein",
    },
    cannot_both_be_empty: {
        en: "Cannot both be empty",
        de: "Es können nicht beide Felder leer sein",
    },
    min_must_be_less_than_max: {
        en: "min must be less than max",
        de: "Der erste Wert muss kleiner sein",
    },
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
    search: {
        en: "Search",
        de: "Suchen",
    },
    search_bar_error: {
        en: "One of the search fields is empty. Please delete empty search fields or enter search criteria.",
        de: "Eine der Suchleisten ist leer. Löschen Sie leere Suchleisten oder fügen Sie Suchkriterien ein.",
    },
    catalogue_expand: {
        en: "Expand Catalogue",
        de: "Katalog ausklappen",
    },
    catalogue_collapse: {
        en: "Collapse Catalogue",
        de: "Katalog einklappen",
    },
    query_in_url_parse_error: {
        en: "Failed to parse the query parameter in the URL",
        de: "Der Query-Parameter in der URL konnte nicht geparst werden",
    },
    query_modified: {
        en: "The query has been modified. Please re-run the search.",
        de: "Die Suchanfrage wurde geändert. Bitte die Suche erneut ausführen.",
    },
    query_info_header: {
        en: "Search ANY of the following groups",
        de: "Sucht EINE dieser Gruppen",
    },
    query_info_group_header: {
        en: "Group",
        de: "Gruppe",
    },
    query_item_multi_row_header_top: {
        en: "Any of",
        de: "Eines aus",
    },
    query_item_multi_row_header: {
        en: "and any of",
        de: "und eines aus",
    },
};
