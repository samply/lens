import { get, writable } from "svelte/store";
import type { QueryItem } from "../types/queryData";
import type { AggregatedValue } from "../types/catalogue";
import { queryStore } from "./query";
import { translate } from "../helpers/translations";

export const datarequestsStore = writable<string[]>([]);

/** Get the list of sites that the user has selected for negotiation in the results table. */
export function getSelectedSites(): string[] {
    return get(datarequestsStore);
}

interface GetHumanReadableQueryAsFormattedString {
    printAggregatedValues?: boolean;
}

/**
 * Formats the query into a human-readable string.
 * @param param0 options.printAggregatedValues if true, the deep values of entities will be parsed and shown
 * @returns a formatted string representation of the query
 */
export function getHumanReadableQueryAsFormattedString({
    printAggregatedValues = false,
}: GetHumanReadableQueryAsFormattedString = {}): string {
    const query: QueryItem[][] = get(queryStore);

    if (query.flat().length === 0) return "";

    const parsedGroups = getParsedStringGroups(query, printAggregatedValues);

    const humanReadable =
        translate("query_info_header") + "\n\n" + parsedGroups.join("\n");

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
            `${translate("query_info_group_header")} ${index + 1}\n` +
            getParsedStringGroup(group, printAggregatedValues) +
            "\n",
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
        "\t" +
        group
            .map((queryItem: QueryItem) => {
                const parsedStringItem = getParsedStringItem(
                    queryItem,
                    printAggregatedValues,
                );
                return parsedStringItem;
            })
            .join("\n\t");

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
                return `${valueItem.name}\n\t${getParsedAggregatedStringValues(valueItem.value)}`;
            }
            return valueItem.name;
        }

        return getMinMax(valueItem.value);
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
            valueItems.push(
                "\t\t\t" +
                    getCatalogueNameFromKey(valueItem.value) +
                    ": " +
                    valueItem.name,
            );
        });
        aggregatedGroups.push(valueItems);
    });

    const parsedAggregatedGroups = aggregatedGroups.map((aggregatedGroup) =>
        aggregatedGroup.join("\n"),
    );

    const parsedAggregatedGroupsString =
        `\t${translate("query_item_multi_row_header_top")} of\n` +
        parsedAggregatedGroups.join(
            `\n\t\t${translate("query_item_multi_row_header")}\n`,
        );
    return parsedAggregatedGroupsString;
};

/**
 * Format a min/max object as a string.
 * @param {{min?: string | number, max?: string | number}} param0
 *   min: The minimum value (string or number, optional).
 *   max: The maximum value (string or number, optional).
 * @returns {string} A string representation of the min/max range.
 */
export const getMinMax = ({
    min,
    max,
}: {
    min?: string | number;
    max?: string | number;
}): string => {
    if (min && max) return `${min} - ${max}`;
    if (!min) return `≤ ${max}`;
    return `≥ ${min}`;
};
