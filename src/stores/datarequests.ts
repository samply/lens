import { get, writable } from "svelte/store";
import type { QueryItem } from "../types/queryData";
import { queryStore } from "./query";
import { catalogue, getCategoryFromKey } from "./catalogue";
import type { AggregatedValue } from "../types/catalogue";
import type {
    GetHumanReadableQuery,
    HumanReadableItem,
    HumanReadableQueryObject,
    HumanReadableGroup,
} from "../types/humanReadable";

export const datarequestsStore = writable<string[]>([]);

/** Get the list of sites that the user has selected for negotiation in the results table. */
export function getSelectedSites(): string[] {
    return get(datarequestsStore);
}

/**
 * When no parameters are parsed, it will return a complete string and will use only the name of the aggregated values
 * @param options.useFullAggregatedValues if true, the deep values of entities will be parsed and shown
 * @param options.getObject if true, the query will be returned as an object.
 * @returns a human readable query either as string or as an object to render HTML
 */
export function getHumanReadableQuery(options?: {
    useFullAggregatedValues?: boolean;
    getObject?: false;
}): string;
export function getHumanReadableQuery(options: {
    useFullAggregatedValues?: boolean;
    getObject: true;
}): HumanReadableQueryObject;

export function getHumanReadableQuery({
    useFullAggregatedValues = false,
    getObject = false,
}: GetHumanReadableQuery = {}): string | HumanReadableQueryObject {
    let parsedQuery!: HumanReadableQueryObject;

    queryStore.subscribe((query: QueryItem[][]) => {
        parsedQuery = {
            header: "Search ANY of the following groups:",
            groups: getParsedGroups(query, useFullAggregatedValues, getObject),
        };
    });

    if (getObject) {
        return parsedQuery satisfies HumanReadableQueryObject;
    }

    return `${parsedQuery.header} ${parsedQuery.groups.map((group) => {
        return `\n${group.groupHeader} ${group.groupItems.map((groupItem) => {
            return `\n\t${groupItem.name}: ${groupItem.values}`;
        })}`;
    })}`;
}

/**
 * @param query the current query
 * @param useFullAggregatedValues sets wether to use just the top level name or all details of items with aggregated values
 * @param getObject sets wether to get an object for further formatting, or a formatted sting
 * @returns an array of objects containing a header and an array of group items for human readability
 */
const getParsedGroups = (
    query: QueryItem[][],
    useFullAggregatedValues: boolean,
    getObject: boolean = false,
): HumanReadableGroup[] => {
    let parsedGroups = [] as HumanReadableGroup[];

    parsedGroups = query.map((group, index): HumanReadableGroup => {
        return {
            groupHeader: `Group ${index + 1}`,
            groupItems: getParsedGroup(
                group,
                useFullAggregatedValues,
                getObject,
            ),
        };
    });

    return parsedGroups;
};

/**
 *
 * @param group the query group to be parsed
 * @param useFullAggregatedValues sets wether to use just the top level name or all details of items with aggregated values
 * @param getObject sets wether to get an object for further formatting, or a formatted sting
 * @returns an array of objects for human readability with name and formatted values
 */
const getParsedGroup = (
    group: QueryItem[],
    useFullAggregatedValues: boolean,
    getObject: boolean = false,
): HumanReadableItem[] => {
    return group.map((queryItem: QueryItem) => {
        const parsedItem: HumanReadableItem = getParsedItem(
            queryItem,
            useFullAggregatedValues,
            getObject,
        );
        return parsedItem;
    });
};

/**
 * @param queryItem the query item to be parsed
 * @param useFullAggregatedValues sets wether to use just the top level name or all details of items with aggregated values
 * @param getObject sets wether to get an object for further formatting, or a formatted sting
 * @param getSingle used for formatting. true will set indentation to the left. false will indent to match the group structure
 * @returns an object with the name of the queryItem and the formatted values
 */
export const getParsedItem = (
    queryItem: QueryItem,
    useFullAggregatedValues: boolean = false,
    getObject: boolean = false,
    getSingle: boolean = false,
): HumanReadableItem => {
    let parsedQueryItem: HumanReadableItem = { name: "", values: "" };
    let name: string = "";
    const values: string = queryItem.values
        .map((valueItem) => {
            if (Array.isArray(valueItem.value) && useFullAggregatedValues) {
                if (!getObject && !getSingle) {
                    name = queryItem.name;
                }
                return getParsedAggregatedValues(
                    valueItem.value,
                    getObject,
                    getSingle,
                );
            } else {
                name = queryItem.name;
                return valueItem.name;
            }
        })
        .join(", ");

    parsedQueryItem = { name, values };
    return parsedQueryItem;
};

/**
 * @param aggregatedValue an array with an AND connection of string arrays with an OR connection
 * @param getObject sets wether the return value should be a string or an array of string arrays
 * @param getSingle used for formatting. true will set indentation to the left. false will indent to match the group structure
 * @returns the formatted values either as string or array of string arrays for further formattintg
 */
const getParsedAggregatedValues = (
    aggregatedValue: AggregatedValue[][],
    getObject: boolean = false,
    getSingle: boolean = false,
): string | string[][] => {
    console.log(aggregatedValue);
    let aggregatedGroups: string[][] = [];

    if (getObject) {
        aggregatedGroups = aggregatedValue.map((value) => {
            return value.map((val) => val.value + ": " + val.name);
        });
        return aggregatedGroups satisfies string[][];
    }

    /**
     * formats the string to be displayed as standalone regarding indentation
     */
    if (getSingle) {
        aggregatedValue.forEach((valueArray) => {
            const valueItems: string[] = [];
            valueArray.forEach((valueItem) => {
                valueItems.push(
                    "  " +
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
            `any of\n` + parsedAggregatedGroups.join("\n\nand any of\n");
        return parsedAggregatedGroupsString;
    }

    /**
     * formats the string to be displayed inside groups regarding indentation
     */
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
        `\n\t\tany of\n` + parsedAggregatedGroups.join("\n\t\tand any of\n");
    return parsedAggregatedGroupsString;
};

/**
 * gets the name of an element with the respective key
 * @param key key of the element to look up the name
 * @returns name of the element
 */
const getCatalogueNameFromKey = (key: string): string => {
    let categoryName = undefined;
    catalogue.subscribe((catalogue) => {
        categoryName = getCategoryFromKey(catalogue, key)?.name;
        if (categoryName === undefined) return;
    });
    return categoryName ? categoryName : key;
};
