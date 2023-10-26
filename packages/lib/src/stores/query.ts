/**
 * Handles the state of the query
 * Consists of multiple arrays which will have an 'or' logic between them later when the query is sent to the server
 */
import type { QueryItem, QueryValue } from "../types/queryData";
import { writable } from "svelte/store";
import { v4 as uuidv4 } from "uuid";



export const queryStore = writable<QueryItem[][]>([[]]);

export const activeQueryGroupIndex = writable(0);

export const queryModified = writable(false);

/**
 * Adds an item to the query
 * If the item already exists in the query, the value will be added to the existing item
 * If the item does not exist in the query, a new item will be created
 * if the item is added to a group that does not exist, a new group will be created
 * if the group index is negative, the item will be added to the first group
 * @param queryObject 
 * @param queryGroupIndex 
 */
export const addItemToQuery = (queryObject: QueryItem, queryGroupIndex: number) => {
    queryModified.set(true);

    /**
     * prevent mutation of the original object
     * otherwise the queryStore will not update properly with live changes inside the catalogue
     * (e.g. when numbers are changed)
     */
    queryObject = Object.assign({}, queryObject)
    queryStore.update((query) => {

        /**
         * handles the case when the group index is negative or too high
         */
        if (queryGroupIndex < 0) queryGroupIndex = 0;

        if (queryGroupIndex > query.length) {
            queryGroupIndex = query.length;
        }

        if (queryGroupIndex === query.length) {
            query = [...query, []]
        }


        /**
         * finds objects with the same name in the query
         */

        let queryStoreGroup: QueryItem[] = query[queryGroupIndex];

        const duplicateObjects: QueryItem[] = 
            findObjectsWithSameName(queryStoreGroup.concat(queryObject));

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
                            (val: QueryValue) => val.name === value.name
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
        queryStoreGroup = queryStoreGroup.filter((item) => item.name !== queryObject.name);
        queryStoreGroup.push(queryObject);
    

        query[queryGroupIndex] = queryStoreGroup;
        return query;

    });
};

/**
 * Removes an item from the query
 * If the item has multiple values, only the value will be removed
 * If the item has only one value, the item will be removed
 * @param queryObject 
 * @param queryGroupIndex 
 */
export const removeValueFromQuery = (queryObject: QueryItem, queryGroupIndex: number) => {
    queryModified.set(true);
    /**
     * prevent mutation of the original object
     * otherwise the queryStore will not update properly with live changes inside the catalogue
     * (e.g. when numbers are changed)
     */
    queryObject = Object.assign({}, queryObject)

    queryStore.update((query) => {
        let queryStoreGroup: QueryItem[] = query[queryGroupIndex];

        queryStoreGroup = queryStoreGroup.map((item) => {
            if (item.name === queryObject.name) {
                item.values = item.values.filter((value: QueryValue) => value.queryBindId !== queryObject.values[0].queryBindId);
            }
            return item;
        });

        queryStoreGroup = queryStoreGroup.filter((item) => item.values.length > 0);

        query[queryGroupIndex] = queryStoreGroup;
        return query;
    });
}


export const removeItemFromQuery = (queryObject: QueryItem, queryGroupIndex: number) => {
    queryModified.set(true);
    /**
     * prevent mutation of the original object
     * otherwise the queryStore will not update properly with live changes inside the catalogue
     * (e.g. when numbers are changed)
     */
    queryObject = Object.assign({}, queryObject)

    queryStore.update((query) => {
        let queryStoreGroup: QueryItem[] = query[queryGroupIndex];

        queryStoreGroup = queryStoreGroup.filter((item) => {
            return item.id !== queryObject.id});

        query[queryGroupIndex] = queryStoreGroup;
        return query;
    });
};

/**
     * finds objects with the same name in an array
     * @param objectsArray
     * @returns QueryItem[]
     */
function findObjectsWithSameName(objectsArray: QueryItem[]) {
    const nameObjectMap = new Map<string, QueryItem[]>();

    objectsArray.forEach((obj: QueryItem) => {
        const name = obj.name;
        if (nameObjectMap.has(name)) {
            nameObjectMap.get(name).push(obj);
        } else {
            nameObjectMap.set(name, [obj]);
        }
    });

    const duplicateObjects: QueryItem[] = Array.from(
        nameObjectMap.values()
    ).filter((objects: QueryItem[]) => objects.length > 1)[0];

    return duplicateObjects;
}


