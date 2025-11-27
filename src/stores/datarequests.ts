import { get, writable } from "svelte/store";
import type { QueryItem } from "../types/queryData";
import type { AggregatedValue } from "../types/catalogue";
import { queryStore } from "./query";
import { translate } from "../helpers/translations";
import { catalogue, getCategoryFromKey } from "./catalogue";
import { buildAstFromQuery } from "../helpers/ast-transformer";
import type { AstElement, AstTopLayer } from "../types/ast";

export const datarequestsStore = writable<string[]>([]);

/** Get the list of sites that the user has selected for negotiation in the results table. */
export function getSelectedSites(): string[] {
    return get(datarequestsStore);
}

/**
 * Adds a site to the datarequestsStore if it is not already present.
 * @param site The site to select.
 */
export function setSiteAsSelected(site: string) {
    datarequestsStore.update((list) =>
        list.includes(site) ? list : [...list, site],
    );
}

/**
 * Removes a site from datarequestsStore.
 * @param site The site to remove.
 */
export function removeSelectedSite(site: string) {
    datarequestsStore.update((list) => list.filter((s) => s !== site));
}

/**
 * Recursively builds a human readable query string from the AST
 * Legacy function, currently used for bbmri negotiator
 * prints out logical structure of the query, not the formatted version
 * @param queryLayer the current layer of the query
 * @param humanReadableQuery string to append to
 * @returns a human readable query string
 */
export const buildHumanReadableRecursively = (
    queryLayer: AstElement,
    humanReadableQuery: string,
): string => {
    if (
        queryLayer === null ||
        !("children" in queryLayer) ||
        ("children" in queryLayer &&
            (queryLayer.children === null ||
                queryLayer.children.length === 0 ||
                queryLayer.children[0] === null))
    ) {
        return humanReadableQuery;
    }

    if (queryLayer.children.length > 1) {
        humanReadableQuery += "(";
    }

    queryLayer.children.forEach((child: AstElement, index: number): void => {
        if (child !== null) {
            if ("type" in child && "value" in child && "key" in child) {
                if (typeof child.value === "string") {
                    humanReadableQuery += `(${child.key} ${child.type} ${child.value})`;
                }
                if (
                    typeof child.value === "object" &&
                    !Array.isArray(child.value) &&
                    ("min" in child.value || "max" in child.value)
                ) {
                    if (
                        child.value.min !== undefined &&
                        child.value.max !== undefined
                    ) {
                        humanReadableQuery += `(${child.key} from ${child.value.min} to ${child.value.max})`;
                    } else if (child.value.min !== undefined) {
                        humanReadableQuery += `(${child.key} greater than or equal to ${child.value.min})`;
                    } else if (child.value.max !== undefined) {
                        humanReadableQuery += `(${child.key} less than or equal to ${child.value.max})`;
                    }
                }
            }

            humanReadableQuery = buildHumanReadableRecursively(
                child,
                humanReadableQuery,
            );

            if (index < queryLayer.children.length - 1) {
                humanReadableQuery += ` ${queryLayer.operand} `;
            }
        }
    });

    if (queryLayer.children.length > 1) {
        humanReadableQuery += ")";
    }

    return humanReadableQuery;
};

/**
 * @returns a human readable query string built from the current query
 */
export const getHumanReadableQuery = (): string => {
    let humanReadableQuery: string = "";

    queryStore.subscribe((value: QueryItem[][]) => {
        const query: AstTopLayer = buildAstFromQuery(value);
        humanReadableQuery = buildHumanReadableRecursively(
            query,
            humanReadableQuery,
        );
    });

    return humanReadableQuery;
};

/**
 * Formats the query into a human-readable string.
 * @param printAggregatedValues if true, the deep values of entities will be parsed and shown
 * @returns a formatted string representation of the query
 */
export function getHumanReadableQueryAsFormattedString(
    printAggregatedValues: boolean = false,
): string {
    const query: QueryItem[][] = get(queryStore);

    if (query.flat().length === 0) return "";

    const parsedGroups = getParsedStringGroups(query, printAggregatedValues);

    const humanReadable =
        translate("query_info_header") + "\r\n\r\n" + parsedGroups.join("\r\n");

    return humanReadable;
}

/**
 * Parses the entire query into formatted strings for each group.
 * @param query the current query
 * @param printAggregatedValues if true, the deep values of entities will be parsed and shown
 * @returns a formatted string representation of the query groups
 */
const getParsedStringGroups = (
    query: QueryItem[][],
    printAggregatedValues: boolean,
): string[] => {
    const parsedGroups = query.map(
        (group, index) =>
            `${translate("query_info_group_header")} ${index + 1}\r\n` +
            getParsedStringGroup(group, printAggregatedValues) +
            "\r\n",
    );
    return parsedGroups;
};

/**
 * Parses a query group into a formatted string.
 * @param group the query group to be parsed
 * @param printAggregatedValues if true, the deep values of entities will be parsed and shown
 * @returns a formatted string representation of the query group
 */
const getParsedStringGroup = (
    group: QueryItem[],
    printAggregatedValues: boolean,
): string => {
    if (group.length === 0) return "";

    const parsedGroup =
        "    " +
        group
            .map((queryItem: QueryItem) => {
                const parsedStringItem = getParsedStringItem(
                    queryItem,
                    printAggregatedValues,
                );
                return parsedStringItem;
            })
            .join("\r\n    ");

    return parsedGroup;
};

/**
 * Parses a query item into a formatted string.
 * @param queryItem the query item to be parsed
 * @param printAggregatedValues if true, the deep values of entities will be parsed and shown
 * @returns a formatted string with name and values of the query item
 */
export const getParsedStringItem = (
    queryItem: QueryItem,
    printAggregatedValues: boolean,
): string => {
    const name: string = queryItem.name;

    const values = queryItem.values.map((valueItem) => {
        if (typeof valueItem.value === "string") {
            return valueItem.value;
        }

        if (Array.isArray(valueItem.value)) {
            if (printAggregatedValues) {
                return `${valueItem.name}\r\n    ${getParsedAggregatedStringValues(valueItem.value)}`;
            }
            return valueItem.name;
        }

        return valueItem.name;
    });

    return `${name}: ${values.join(", ")}`;
};

/**
 * Formats an array with an AND connection of string arrays with an OR connection.
 * @param aggregatedValue an array with an AND connection of string arrays with an OR connection
 * @returns the formatted values as string
 */
const getParsedAggregatedStringValues = (
    aggregatedValue: AggregatedValue[][],
): string => {
    const aggregatedGroups: string[][] = [];

    aggregatedValue.forEach((valueArray) => {
        const valueItems: string[] = [];
        valueArray.forEach((valueItem) => {
            const categoryName: string =
                getCategoryFromKey(get(catalogue), valueItem.value)?.name ??
                valueItem.value;
            valueItems.push(
                "            " + categoryName + ": " + valueItem.name,
            );
        });
        aggregatedGroups.push(valueItems);
    });

    const parsedAggregatedGroups = aggregatedGroups.map((aggregatedGroup) =>
        aggregatedGroup.join("\r\n"),
    );

    const parsedAggregatedGroupsString =
        `    ${translate("query_item_multi_row_header_top")}\r\n` +
        parsedAggregatedGroups.join(
            `\r\n        ${translate("query_item_multi_row_header")}\r\n`,
        );
    return parsedAggregatedGroupsString;
};
