import { writable } from "svelte/store";
import { type Category, type Criteria, type TreeNode } from "../types/treeData";
import {
    isBottomLayer,
    isTopLayer,
    type AstElement,
    type AstTopLayer,
} from "../types/ast";

/**
 * store to hold the catalogue
 * populated by the searchbar or the catalogue
 * DISCUSSION: should there be a seperate component without markup just for populating for the catalogue?
 * there could be some corner cases for that
 */

export const catalogue = writable<Category[]>([]);

const resolveSubgroupButtoumLayer = (criteria: Criteria[]): string[] => {
    let collectedCriteria: string[] = [];
    criteria.forEach((element) => {
        if (element.subgroup instanceof Array) {
            collectedCriteria = collectedCriteria.concat(
                resolveSubgroupButtoumLayer(element.subgroup),
            );
        } else {
            collectedCriteria = collectedCriteria.concat(element.key);
        }
    });

    return collectedCriteria;
};

const resolveElementInCatalogueRec = (
    key: string,
    value: string,
    node: Category,
): string[] => {
    let newCri: string[] = [];

    if (node.nodeType === "leaf") {
        if (node.key === key) {
            for (const cri of node.criteria) {
                if (cri.key == value) {
                    if (cri.subgroup instanceof Array) {
                        newCri = newCri.concat(
                            resolveSubgroupButtoumLayer(cri.subgroup),
                        );
                        break;
                    }
                }
            }
        }
    } else if (node.nodeType === "branch") {
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
            if (element.nodeType === "branch") {
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

const resolveAstSubCatagoriesRec = (query: AstElement): AstElement => {
    let elements: AstElement[] = [];
    if (isTopLayer(query)) {
        query.children.forEach((element) => {
            elements = elements.concat(resolveAstSubCatagoriesRec(element));
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
                        nodeType: "leaf",
                        key: query.key,
                        type: query.type,
                        system: query.system,
                        value: x,
                    });
                });
                return {
                    nodeType: "branch",
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
 * This function takes a query in ast form and replaces all the subcatagories, eg. all icd-10 diagnosis like C00.% will be replace with C00.1...
 * @param query The Query as Ast Element
 * @returns The new Query with replace elements
 */
export const resolveAstSubCatagories = (query: AstTopLayer): AstTopLayer => {
    query.children.forEach((element, i) => {
        query.children[i] = resolveAstSubCatagoriesRec(element);
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
        bottomLevelItems = getBottomLevelItems(catalogue, category);
    });

    return bottomLevelItems;
};

/**
 * @param item the TreeNode you want to check
 * @returns true if the item is a bottom level item, false otherwise
 */
const itemIsBottomLevel = (item: TreeNode): boolean => {
    if (
        item instanceof Array ||
        "childCategories" in item ||
        "criteria" in item ||
        "aggregatedValue" in item ||
        "fieldType" in item
    ) {
        return false;
    }
    return true;
};

/**
 * @param item takes any item from the catalogue
 * @param category string of the category you want to get the bottom level items from
 * @returns an array of strings containing the bottom level items' keys
 */
const getBottomLevelItems = (item: TreeNode, category: string): string[] => {
    /**
     * FIX ME:
     *  there seems to be a race condition where the catalogue is not yet loaded and the function is called right away
     *  the data being a string comes from the data being passed as a json string
     */
    if (typeof item === "string") {
        return [];
    }

    if (item instanceof Array) {
        return item
            .map((childCategory) =>
                getBottomLevelItems(childCategory, category),
            )
            .flat()
            .filter((item) => item !== undefined);
    }

    if ("childCategories" in item) {
        return (
            item.childCategories
                ?.map((childCategory) =>
                    getBottomLevelItems(childCategory, category),
                )
                .flat() || []
        );
    }

    if ("criteria" in item && item.key === category) {
        return item.criteria
            .map((criterion) => getBottomLevelItems(criterion, category))
            .flat();
    }

    /**
     * TODO:
     * find deeper nested items to search for eg glioma
     * not needed for right now
     */

    // if ('criteria' in item) {
    //     return item.criteria.map((criterion) => {
    //         if (criterion.aggregatedValue) {
    //             return getBottomLevelItems(criterion, category)
    //         }
    //     }).flat()
    // }

    // if ('aggregatedValue' in item) {
    //     return item.aggregatedValue.map((aggregatedValue) => getBottomLevelItems(aggregatedValue, category)).flat()
    // }

    if (itemIsBottomLevel(item) && "key" in item) {
        let array: string[] = [];
        array.push(item.key);
        if ("subgroup" in item) {
            item.subgroup?.forEach((element) => {
                array = array.concat(getBottomLevelItems(element, category));
            });
        }
        return array;
    }

    return [];
};

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
