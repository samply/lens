import { get, writable } from "svelte/store";
import { buildAstFromQuery } from "../helpers/ast-transformer";
import {
    isBottomLayer,
    isTopLayer,
    type AstElement,
    type AstTopLayer,
} from "../types/ast";
import type { QueryItem } from "../types/queryData";
import { queryStore } from "./query";
import { catalogue } from "./catalogue";

export const datarequestsStore = writable<string[]>([]);

/** Get the list of sites that the user has selected for negotiation in the results table. */
export function getSelectedSites(): string[] {
    return get(datarequestsStore);
}

/**
 * @returns a human readable query string built from the current query
 */
export const getHumanReadableQuery = (): newHumanReadableQuery => {
    const humanReadableQuery: newHumanReadableQuery = {
        header: "Search for all results",
        groups: getGroups(),
    };

    return humanReadableQuery;
};

/**
 * gets all bottom layer items which are transformed into human readable strings
 * @returns the groups for displaying the different search bars
 */
const getGroups = (): HumanReadableGroup[] => {
    let groups: HumanReadableGroup[] = [];

    queryStore.subscribe((value: QueryItem[][]) => {
        const queryAST: AstTopLayer = buildAstFromQuery(value);

        groups = queryAST.children.map((astChildren: AstElement, index) => {
            return {
                groupHeader: `Group ${index + 1} - ALL must apply`,
                groupItems: isTopLayer(astChildren)
                    ? astChildren.children.map((child) =>
                          buildBottomLayerItems(child as AstTopLayer),
                      )
                    : [],
            };
        });
    });

    return groups;
};

const buildBottomLayerItems = (astBottomLayerValue: AstTopLayer): string => {
    let humanReadableItem: string[] = [];

    humanReadableItem = astBottomLayerValue.children.map((child) => {
        if (!isBottomLayer(child)) return "";

        if (typeof child.value === "string") {
            return child.value;
        }

        if (
            typeof child.value === "object" &&
            "min" in child.value &&
            "max" in child.value
        ) {
            const min =
                child.value.min !== undefined ? child.value.min + ` - ` : ``;
            const max = child.value.max !== undefined ? child.value.max : ``;
            return min + max;
        }

        return "";
    });

    let categoryName: string | undefined;

    catalogue.subscribe((store) => {
        categoryName = store.find(
            (category) => category.key === astBottomLayerValue.key,
        )?.name;
    });

    if (categoryName === undefined) return "";

    return categoryName + ": " + humanReadableItem.join(" or ");
};

export type newHumanReadableQuery = {
    header: string;
    groups: HumanReadableGroup[];
};

export type HumanReadableGroup = {
    groupHeader: string;
    groupItems: string[];
};
