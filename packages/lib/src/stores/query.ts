/**
 * Handles the state of the query
 * Consists of multiple arrays which will have an 'or' logic between them later when the query is sent to the server
 */
import { v4 as uuidv4 } from "uuid";
import type { AutoCompleteItem, QueryItem } from "../types/queryData";
import { writable } from "svelte/store";

export const queryStore = writable([]);

/**
 * 
 * @param queryObject 
 * @param queryGroupIndex 
 */
export const addItemToQuery = (queryObject: QueryItem, queryGroupIndex: number) => {

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
            /**
             * if the group does not contain an item with the same name create a new item
             */
            queryStoreGroup.push({
                id: uuidv4(),
                ...queryObject,
            });
        } else {
            /**
             * if the group does contain an item with the same name update the values
             */
            queryStoreGroup.map((item) => {
                if (item.name === queryObject.name) {
                    item.values = [
                        ...item.values,
                        {
                            key: queryObject.values[0].key,
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
