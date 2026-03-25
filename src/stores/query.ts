import type { Query, QueryItem, SetItem } from "../types/query";
import { writable, get } from "svelte/store";

export const queryStore = writable<Query>({ bars: [{ items: [] }] });

export function getQueryStore(): Query {
    return get(queryStore);
}

/**
 * Set the query store. Makes a deep copy so modifying the original object has no effect.
 */
export function setQueryStore(query: Query): void {
    queryStore.set(structuredClone(query));
}

/** The index of the currently active search bar. */
export const activeQueryGroupIndex = writable<number>(0);

/** Whether the query has been modified since the last search. */
export const queryModified = writable<boolean>(false);

queryStore.subscribe(() => {
    const event = new CustomEvent("lens-query-updated");
    window.dispatchEvent(event);
});

/**
 * Add an item to the query. If an item with the same key and type already
 * exists in the target bar, the values are merged (for SetItems, values are
 * deduplicated). If the bar index is out of range, a new bar is created.
 */
export const addItemToQuery = (
    queryObject: QueryItem,
    barIndex: number,
): void => {
    queryModified.set(true);
    queryObject = structuredClone(queryObject);

    queryStore.update((prev) => {
        const query = structuredClone(prev);
        if (barIndex < 0) barIndex = 0;
        if (barIndex > query.bars.length) barIndex = query.bars.length;
        if (barIndex === query.bars.length) {
            query.bars.push({ items: [] });
        }

        const bar = query.bars[barIndex];
        const existingIndex = bar.items.findIndex(
            (item) =>
                item.key === queryObject.key && item.type === queryObject.type,
        );

        if (existingIndex !== -1 && queryObject.type === "SetItem") {
            const existing = bar.items[existingIndex] as SetItem;
            const incoming = queryObject as SetItem;
            for (const val of incoming.values) {
                if (!existing.values.includes(val)) {
                    existing.values.push(val);
                }
            }
        } else if (existingIndex !== -1) {
            bar.items[existingIndex] = queryObject;
        } else {
            bar.items.push(queryObject);
        }

        return query;
    });
};

/**
 * Remove a single value from a SetItem. If the item has only one value
 * remaining, it is removed entirely.
 */
export const removeValueFromQuery = (
    key: string,
    value: string,
    barIndex: number,
): void => {
    queryModified.set(true);
    queryStore.update((prev) => {
        const query = structuredClone(prev);
        const bar = query.bars[barIndex];
        if (!bar) return query;

        bar.items = bar.items
            .map((item) => {
                if (item.key === key && item.type === "SetItem") {
                    const setItem = item as SetItem;
                    return {
                        ...setItem,
                        values: setItem.values.filter((v) => v !== value),
                    };
                }
                return item;
            })
            .filter((item) => {
                if (item.type === "SetItem") {
                    return (item as SetItem).values.length > 0;
                }
                return true;
            });

        return query;
    });
};

/**
 * Remove an entire item from the query bar.
 */
export const removeItemFromQuery = (
    key: string,
    type: string,
    barIndex: number,
): void => {
    queryModified.set(true);
    queryStore.update((prev) => {
        const query = structuredClone(prev);
        const bar = query.bars[barIndex];
        if (!bar) return query;

        bar.items = bar.items.filter(
            (item) => !(item.key === key && item.type === type),
        );

        return query;
    });
};

/**
 * Add an item to the currently active query bar. Makes a deep copy of the
 * query item so modifying the original object has no effect.
 */
export const addItemToActiveQueryGroup = (queryObject: QueryItem): void => {
    const groupIndex = get(activeQueryGroupIndex);
    addItemToQuery(structuredClone(queryObject), groupIndex);
};
