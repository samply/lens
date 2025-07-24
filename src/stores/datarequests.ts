import { get, writable } from "svelte/store";

import { buildAstFromQuery } from "../helpers/ast-transformer";
import type { AstElement, AstTopLayer } from "../types/ast";
import type { QueryItem } from "../types/queryData";
import { queryStore } from "./query";

export const datarequestsStore = writable<string[]>([]);

/** Get the list of sites that the user has selected for negotiation in the results table. */
export function getSelectedSites(): string[] {
    return get(datarequestsStore);
}

/**
 * Recursively builds a human readable query string from the AST
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
