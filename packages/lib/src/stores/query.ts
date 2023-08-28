/**
 * Handles the state of the query
 * Consists of multiple arrays which will have an 'or' logic between them later when the query is sent to the server
 */
import { v4 as uuidv4 } from "uuid";
import type { QueryItem } from "../types/queryData";
import { writable } from "svelte/store";

export const queryStore = writable([[]]);

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
    /**
     * prevent mutation of the original object
     * otherwise the queryStore will not update properly with live changes inside the catalogue
     * (e.g. when numbers are changed)
     */
    queryObject = Object.assign({}, queryObject)
    queryStore.update((query) => {

        if (queryGroupIndex < 0) queryGroupIndex = 0;

        if (queryGroupIndex > query.length) {
            queryGroupIndex = query.length;
        }

        if (queryGroupIndex === query.length) {
            query = [...query, []]
        }

        const queryStoreGroup: QueryItem[] = query[queryGroupIndex];
        const existingItem: QueryItem = queryStoreGroup.find(
            (item) => item.name === queryObject.name
        );

        if (existingItem === undefined) {
            queryStoreGroup.push(queryObject);
        } else {
            queryStoreGroup.map((item) => {
                if (item.name === queryObject.name) {
                    item.values = [
                        ...item.values,
                        {
                            value: queryObject.values[0].value,
                            name: queryObject.values[0].name,
                        },
                    ];
                }
                return item;
            });
        }

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
export const removeItemFromQuery = (queryObject: QueryItem, queryGroupIndex: number) => {
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
                item.values = item.values.filter((value) => value.queryBindId !== queryObject.values[0].queryBindId);
            }
            return item;
        });

        queryStoreGroup = queryStoreGroup.filter((item) => item.values.length > 0);

        query[queryGroupIndex] = queryStoreGroup;
        return query;
    });
}