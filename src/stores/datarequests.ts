import { get, writable } from "svelte/store";
import type { Query, QueryItem } from "../types/query";
import { queryStore } from "./query";
import { translate } from "../helpers/translations";
import { elementMap, optionMap } from "./catalogue";
import { buildAstFromQuery } from "../helpers/ast-transformer";
import type { AstNode } from "../types/ast";

export const datarequestsStore = writable<string[]>([]);

/** Get the list of sites that the user has selected for negotiation in the results table. */
export function getSelectedSites(): string[] {
    return get(datarequestsStore);
}

/**
 * Adds a site as selected for a data request.
 */
export function selectSite(site: string) {
    datarequestsStore.update((list) =>
        list.includes(site) ? list : [...list, site],
    );
}

/**
 * Unselect a site for a data request.
 */
export function unselectSite(site: string) {
    datarequestsStore.update((list) => list.filter((s) => s !== site));
}

/**
 * Recursively builds a human readable query string from the AST.
 */
export const buildHumanReadableRecursively = (node: AstNode): string => {
    switch (node.type) {
        case "AndOperator":
        case "OrOperator": {
            if (node.operands.length === 0) return "";
            const operand = node.type === "AndOperator" ? "AND" : "OR";
            const parts = node.operands.map((child) =>
                buildHumanReadableRecursively(child),
            );
            if (parts.length === 1) return parts[0];
            return "(" + parts.join(` ${operand} `) + ")";
        }
        case "NotOperator":
            return `NOT (${buildHumanReadableRecursively(node.operand)})`;
        case "SetFilter":
            return `(${node.key} IN [${node.values.join(", ")}])`;
        case "NumericRangeFilter": {
            if (node.min !== undefined && node.max !== undefined) {
                return `(${node.key} from ${node.min} to ${node.max})`;
            } else if (node.min !== undefined) {
                return `(${node.key} >= ${node.min})`;
            } else if (node.max !== undefined) {
                return `(${node.key} <= ${node.max})`;
            }
            return `(${node.key})`;
        }
        case "DateRangeFilter": {
            if (node.min !== undefined && node.max !== undefined) {
                return `(${node.key} from ${node.min} to ${node.max})`;
            } else if (node.min !== undefined) {
                return `(${node.key} >= ${node.min})`;
            } else if (node.max !== undefined) {
                return `(${node.key} <= ${node.max})`;
            }
            return `(${node.key})`;
        }
    }
};

/**
 * Returns a human readable query string built from the current query AST.
 */
export const getHumanReadableQuery = (): string => {
    const query = get(queryStore);
    const ast = buildAstFromQuery(query);
    return buildHumanReadableRecursively(ast);
};

/**
 * Formats the query into a human-readable string.
 */
export function getHumanReadableQueryAsFormattedString(): string {
    const query: Query = get(queryStore);

    if (query.bars.every((b) => b.items.length === 0)) return "";

    const elMap = get(elementMap);
    const opMap = get(optionMap);

    const parsedBars = query.bars.map(
        (bar, index) =>
            `${translate("query_info_group_header")} ${index + 1}\r\n` +
            formatBar(bar.items, elMap, opMap) +
            "\r\n",
    );

    return (
        translate("query_info_header") + "\r\n\r\n" + parsedBars.join("\r\n")
    );
}

function formatBar(
    items: QueryItem[],
    elMap: Map<string, import("../types/catalogue").CatalogueElement>,
    opMap: Map<string, import("../types/catalogue").CatalogueOption>,
): string {
    if (items.length === 0) return "";
    return (
        "    " +
        items.map((item) => formatItem(item, elMap, opMap)).join("\r\n    ")
    );
}

function formatItem(
    item: QueryItem,
    elMap: Map<string, import("../types/catalogue").CatalogueElement>,
    opMap: Map<string, import("../types/catalogue").CatalogueOption>,
): string {
    const name = elMap.get(item.key)?.name ?? item.key;
    switch (item.type) {
        case "SetItem":
            return `${name}: ${item.values.map((v) => opMap.get(`${item.key}.${v}`)?.name ?? v).join(", ")}`;
        case "NumericRangeItem":
            return `${name}: ${item.min ?? "∞"} – ${item.max ?? "∞"}`;
        case "DateRangeItem":
            return `${name}: ${item.min ?? "∞"} – ${item.max ?? "∞"}`;
    }
}
