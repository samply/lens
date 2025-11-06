import { writable } from "svelte/store";
import type { Catalogue, Criteria, Category } from "../types/catalogue";
import {
    isBottomLayer,
    isTopLayer,
    type AstElement,
    type AstTopLayer,
} from "../types/ast";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import catalogueSchema from "../../schema/catalogue.schema.json";

/**
 * store to hold the catalogue
 * populated by the searchbar or the catalogue
 * DISCUSSION: should there be a seperate component without markup just for populating for the catalogue?
 * there could be some corner cases for that
 */

export const catalogue = writable<Catalogue>([]);

const resolveSubgroupBottomLayer = (criteria: Criteria[]): string[] => {
    let collectedCriteria: string[] = [];
    criteria.forEach((element) => {
        if (element.subgroup instanceof Array) {
            collectedCriteria = collectedCriteria.concat(
                resolveSubgroupBottomLayer(element.subgroup),
            );
        } else {
            collectedCriteria = collectedCriteria.concat(element.key);
        }
    });

    return collectedCriteria;
};

const resolveSubgroupMatch = (
    key: string,
    value: string,
    subgroup: Criteria[],
): string[] => {
    let newCri: string[] = [];

    for (const cri of subgroup) {
        if (cri.key == value) {
            if (cri.subgroup instanceof Array) {
                newCri = newCri.concat(
                    resolveSubgroupBottomLayer(cri.subgroup),
                );
                break;
            }
        }
        // Search deeper in the structure for a match
        if (cri.subgroup instanceof Array) {
            resolveSubgroupMatch(key, value, cri.subgroup);
        }
    }

    return newCri;
};

const resolveElementInCatalogueRec = (
    key: string,
    value: string,
    node: Category,
): string[] => {
    let newCri: string[] = [];

    if (
        node.fieldType === "single-select" ||
        node.fieldType === "autocomplete"
    ) {
        if (node.key === key) {
            for (const cri of node.criteria) {
                if (cri.key == value) {
                    if (cri.subgroup instanceof Array) {
                        newCri = newCri.concat(
                            resolveSubgroupBottomLayer(cri.subgroup),
                        );
                        break;
                    }
                }
                // Search deeper in the structure for a match
                if (cri.subgroup instanceof Array) {
                    newCri = newCri.concat(
                        resolveSubgroupMatch(key, value, cri.subgroup),
                    );
                }
            }
        }
    } else if (node.fieldType === "group") {
        node.childCategories?.forEach((y) => {
            newCri = newCri.concat(resolveElementInCatalogueRec(key, value, y));
        });
    }

    return newCri;
};

const resolveElementInCatalogue = (key: string, value: string): string[] => {
    let subcatagories: string[] = [];
    catalogue.subscribe((x) => {
        x.forEach((element) => {
            if ("childCategories" in element) {
                element.childCategories.forEach((y: Category) => {
                    subcatagories = subcatagories.concat(
                        resolveElementInCatalogueRec(key, value, y),
                    );
                });
            }
        });
    });
    return subcatagories;
};

const resolveAstSubgroupsRec = (query: AstElement): AstElement => {
    let elements: AstElement[] = [];
    if (isTopLayer(query)) {
        query.children.forEach((element) => {
            elements = elements.concat(resolveAstSubgroupsRec(element));
        });
        query.children = elements;
        return query;
    } else if (isBottomLayer(query)) {
        if (typeof query.value === "string") {
            const subcatagories = resolveElementInCatalogue(
                query.key,
                query.value,
            );
            if (subcatagories.length == 0) {
                return query;
            } else {
                subcatagories.forEach((x) => {
                    elements.push({
                        key: query.key,
                        type: query.type,
                        system: query.system,
                        value: x,
                    });
                });
                return {
                    operand: "OR",
                    key: query.key,
                    children: elements,
                };
            }
        } else {
            return query;
        }
    } else {
        console.error("Element not a query");
    }
    return query;
};

/**
 * This function takes a query in ast form and replaces all the subgroups, eg. all icd-10 diagnosis like C00.% will be replace with C00.1...
 * @param query The Query as Ast Element
 * @returns The new Query with replace elements
 */
export const resolveAstSubgroups = (query: AstTopLayer): AstTopLayer => {
    query.children.forEach((element, i) => {
        query.children[i] = resolveAstSubgroupsRec(element);
    });

    return query;
};

export const openTreeNodes = writable<
    Map<string, { key: string; subCategoryNames: string[] | null }>
>(new Map());

/**
 * get the bottom level items of a category
 * @param category string of the category you want to get the bottom level items from
 * @returns array of strings containing the bottom level items' keys
 */
export const getCriteria = (category: string): string[] => {
    let bottomLevelItems: string[] = [];

    catalogue.subscribe((catalogue) => {
        bottomLevelItems = getCriteriaValuesOfCategoryWithKey(
            catalogue as Catalogue,
            category,
        );
    });

    return bottomLevelItems;
};

/**
 * Find the category with the provided key and return the values of all its possible criteria.
 * @param categories The category tree to search
 * @param categoryKey The key of the category to search for
 * @returns The values of all criteria of the found category
 */
function getCriteriaValuesOfCategoryWithKey(
    categories: Category[],
    categoryKey: string,
): string[] {
    for (const category of categories) {
        if (
            (category.fieldType === "single-select" ||
                category.fieldType === "autocomplete") &&
            category.key === categoryKey
        ) {
            /**
             * Walk the provided criteria recursively and collect all values.
             * @param criteria the list of criteria
             * @returns all values
             */
            const getCriteriaValuesRecursively = (
                criteria: Criteria[],
            ): string[] => {
                const values = [];
                for (const criterion of criteria) {
                    values.push(criterion.key);
                    if (criterion.subgroup !== undefined) {
                        values.push(
                            ...getCriteriaValuesRecursively(criterion.subgroup),
                        );
                    }
                }
                return values;
            };

            return getCriteriaValuesRecursively(category.criteria);
        }

        if (category.fieldType === "group") {
            const values = getCriteriaValuesOfCategoryWithKey(
                category.childCategories,
                categoryKey,
            );
            if (values.length !== 0) {
                return values;
            }
        }
    }

    return [];
}

export const getCriteriaNamesFromKey = (
    catalogue: Category[],
    key: string,
): string[] => {
    let criteriaNames: string[] = [];

    if (catalogue.length === 0 || key === "") {
        return criteriaNames;
    }

    catalogue.forEach((category: Category): void => {
        if ("childCategories" in category) {
            category.childCategories?.forEach(
                (childCategory: Category): void => {
                    if (
                        "criteria" in childCategory &&
                        childCategory.key === key
                    ) {
                        criteriaNames = childCategory.criteria.map(
                            (criterion) => criterion.name,
                        );
                    }
                },
            );
        }
    });

    if (criteriaNames.length === 0) {
        criteriaNames = ["20", "30", "40", "50"];
    }
    return criteriaNames;
};

export const getCategoryFromKey = (
    catalogue: Category[],
    key: string,
): Category | undefined => {
    let category: Category | undefined = undefined;

    if (catalogue.length === 0 || key === "") {
        return category;
    }

    catalogue.forEach((catalogueEntry: Category) => {
        if ("childCategories" in catalogueEntry) {
            if (catalogueEntry.childCategories != undefined) {
                const result = getCategoryFromKey(
                    catalogueEntry.childCategories,
                    key,
                );
                if (result != undefined) category = result;
            }
        } else {
            if (catalogueEntry.key === key) {
                category = catalogueEntry;
            }
        }
    });

    return category;
};

export const getCriteriaFromKey = (
    catalogue: Category[],
    categoryKey: string,
    criteriaKey: string,
): Criteria | undefined => {
    const category: Category | undefined = getCategoryFromKey(
        catalogue,
        categoryKey,
    );
    if (category == undefined) return undefined;
    if ("criteria" in category) {
        return category.criteria.find(
            (criteria) => criteria.key === criteriaKey,
        );
    }
    return undefined;
};

/**
 * Set the catalogue. A warning is logged to the browser console if the catalogue does not match the JSON schema. Note that function makes a deep copy of the catalogue so modifying the original object has no effect.
 */
export function setCatalogue(newCatalogue: Catalogue) {
    // Make a copy to avoid modifying the original object
    const catalogueCopy = structuredClone(newCatalogue);
    const ajv = new Ajv({
        allErrors: true,
        removeAdditional: true,
    });
    addFormats(ajv);
    const valid = ajv.validate(catalogueSchema, catalogueCopy);
    if (!valid) {
        console.warn(
            "Catalogue does not conform with JSON schema: " +
                JSON.stringify(ajv.errors),
        );
    }
    catalogue.set(catalogueCopy);
}
