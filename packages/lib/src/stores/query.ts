/**
 * Handles the state of the query
 * Consists of multiple arrays which will have an 'or' logic between them later when the query is sent to the server
 */
import type { QueryItem, QueryValue } from "../types/queryData";
import { writable } from "svelte/store";
import { v4 as uuidv4 } from "uuid";
import type { Category, Criteria } from "../types/treeData";

export const queryStore = writable<QueryItem[][]>([[]]);

export const queryBase64Store = writable<string>("");

/**
 * when the url has a query as base64 string, this will be parsed and the queryStore will be updated
 */
const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
const queryParam: string | null = urlParams.get("query");

if (queryParam !== null) {
    const queryParamDecoded: QueryItem[][] = JSON.parse(atob(queryParam));
    queryStore.set(queryParamDecoded);
}

/**
 * the index of the currently active search bar
 */
export const activeQueryGroupIndex = writable<number>(0);

/**
 * checks if the query has been modified since the last time the query was sent to the server
 */
export const queryModified = writable<boolean>(false);

/**
 * Adds an item to the query
 * If the item already exists in the query, the value will be added to the existing item
 * If the item does not exist in the query, a new item will be created
 * if the item is added to a group that does not exist, a new group will be created
 * if the group index is negative, the item will be added to the first group
 * @param queryObject - the object to be added to the store
 * @param queryGroupIndex - the index of the group (searchbar) where the object should be added
 */
export const addItemToQuery = (
    queryObject: QueryItem,
    queryGroupIndex: number,
): void => {
    queryModified.set(true);

    /**
     * prevent mutation of the original object
     * otherwise the queryStore will not update properly with live changes inside the catalogue
     * (e.g. when numbers are changed)
     */
    queryObject = Object.assign({}, queryObject);
    queryStore.update((query) => {
        /**
         * handles the case when the group index is negative or too high
         */
        if (queryGroupIndex < 0) queryGroupIndex = 0;

        if (queryGroupIndex > query.length) {
            queryGroupIndex = query.length;
        }

        if (queryGroupIndex === query.length) {
            query = [...query, []];
        }

        /**
         * finds objects with the same name in the query
         */

        let queryStoreGroup: QueryItem[] = query[queryGroupIndex];

        const duplicateObjects: QueryItem[] = findObjectsWithSameName(
            queryStoreGroup.concat(queryObject),
        );

        /**
         * merges the values of the duplicate objects
         */
        if (duplicateObjects !== undefined) {
            queryObject = {
                id: uuidv4(),
                key: duplicateObjects[0].key,
                name: duplicateObjects[0].name,
                type: duplicateObjects[0].type,
                system: duplicateObjects[0].system,
                values: [],
            };
            duplicateObjects.forEach((obj: QueryItem) => {
                obj.values.forEach((value: QueryValue) => {
                    /**
                     * writes the first value of the first object to the values
                     */
                    if (
                        !queryObject.values.some(
                            (val: QueryValue) => val.name === value.name,
                        )
                    ) {
                        queryObject.values.push(value);
                    }
                });
            });
        }

        /**
         * removes all items with the same name from the group,
         * then adds the new item
         */
        queryStoreGroup = queryStoreGroup.filter(
            (item) => item.name !== queryObject.name,
        );
        queryStoreGroup.push(queryObject);

        query[queryGroupIndex] = queryStoreGroup;
        return query;
    });
};

/**
 * Removes an value of an Item from the query
 * If the item has multiple values, only the value will be removed
 * If the item has only one value, the item will be removed
 * @param queryObject - the object to be removed
 * @param queryGroupIndex - the index of the group (searchbar) where the object is located
 */
export const removeValueFromQuery = (
    queryObject: QueryItem,
    queryGroupIndex: number,
): void => {
    queryModified.set(true);
    /**
     * prevent mutation of the original object
     * otherwise the queryStore will not update properly with live changes inside the catalogue
     * (e.g. when numbers are changed)
     */
    queryObject = Object.assign({}, queryObject);

    queryStore.update((query) => {
        let queryStoreGroup: QueryItem[] = query[queryGroupIndex];

        queryStoreGroup = queryStoreGroup.map((item) => {
            if (item.name === queryObject.name) {
                item.values = item.values.filter(
                    (value: QueryValue) =>
                        value.queryBindId !== queryObject.values[0].queryBindId,
                );
            }
            return item;
        });

        queryStoreGroup = queryStoreGroup.filter(
            (item) => item.values.length > 0,
        );

        query[queryGroupIndex] = queryStoreGroup;
        return query;
    });
};

/**
 * removes an item from the query
 * @param queryObject the object to be removed
 * @param queryGroupIndex index of the group where the object is located
 */
export const removeItemFromQuery = (
    queryObject: QueryItem,
    queryGroupIndex: number,
): void => {
    queryModified.set(true);
    /**
     * prevent mutation of the original object
     * otherwise the queryStore will not update properly with live changes inside the catalogue
     * (e.g. when numbers are changed)
     */
    queryObject = Object.assign({}, queryObject);

    queryStore.update((query: QueryItem[][]) => {
        let queryStoreGroup: QueryItem[] = query[queryGroupIndex];

        queryStoreGroup = queryStoreGroup.filter((item) => {
            return item.id !== queryObject.id;
        });

        query[queryGroupIndex] = queryStoreGroup;
        return query;
    });
};

/**
 * finds objects with the same name in an array
 * @param objectsArray - the array to be searched
 * @returns the objects with the same name
 */
function findObjectsWithSameName(objectsArray: QueryItem[]): QueryItem[] {
    const nameObjectMap = new Map<string, QueryItem[]>();

    objectsArray.forEach((obj: QueryItem) => {
        const name = obj.name;
        if (nameObjectMap.has(name)) {
            nameObjectMap.get(name)?.push(obj);
        } else {
            nameObjectMap.set(name, [obj]);
        }
    });

    const duplicateObjects: QueryItem[] = Array.from(
        nameObjectMap.values(),
    ).filter((objects: QueryItem[]) => objects.length > 1)[0];

    return duplicateObjects;
}

/**
 * adds a single stratifier to the query
 * numbers can be grouped together by setting the groupRange
 * @param label the value of the stratifier (e.g. "C31")
 * @param catalogue the catalogue where the stratifier is located
 * @param catalogueGroupCode the code of the group where the stratifier is located (e.g. "diagnosis")
 * @param queryGroupIndex the index of the query group where the stratifier should be added
 */

export interface AddStratifierParams {
    label: string;
    catalogueGroupCode: string;
    catalogue: Category[];
    queryGroupIndex?: number;
    groupRange?: number;
}

export const addStratifier = ({
    label,
    catalogue,
    catalogueGroupCode,
    queryGroupIndex = 0,
    groupRange = 1,
}: AddStratifierParams): void => {
    let queryItem: QueryItem;
    catalogue.forEach((parentCategory: Category) => {
        if ("childCategories" in parentCategory) {
            parentCategory.childCategories?.forEach(
                (childCategorie: Category) => {
                    if (
                        childCategorie.key === catalogueGroupCode &&
                        "criteria" in childCategorie
                    ) {
                        let values: QueryValue[] = [];

                        if (childCategorie.fieldType === "number") {
                            values = [
                                {
                                    name: `${label}`,
                                    value: {
                                        min: parseInt(label),
                                        max: parseInt(label) + groupRange - 1,
                                    },
                                    queryBindId: uuidv4(),
                                },
                            ];
                        } else {
                            childCategorie.criteria.forEach(
                                (criterion: Criteria) => {
                                    if (criterion.key === label) {
                                        values[0] = {
                                            name: criterion.name,
                                            value: criterion.key,
                                            queryBindId: uuidv4(),
                                            description: criterion.description,
                                        };
                                    }
                                },
                            );
                        }

                        queryItem = {
                            id: uuidv4(),
                            key: childCategorie.key,
                            name: childCategorie.name,
                            system:
                                "system" in childCategorie
                                    ? childCategorie.system
                                    : "",
                            type:
                                "type" in childCategorie
                                    ? childCategorie.type
                                    : "BETWEEN",
                            values: values,
                        };

                        addItemToQuery(queryItem, queryGroupIndex);
                    }
                },
            );
        }
    });
};
