import { beforeEach, describe, expect, test } from "vitest";
import { get } from "svelte/store";
import {
    queryStore,
    addItemToQuery,
    removeValueFromQuery,
    removeItemFromQuery,
    setQueryStore,
} from "./query";
import type { QueryItem } from "../types/queryData";

function makeItem(overrides: Partial<QueryItem> = {}): QueryItem {
    return {
        id: "id-1",
        key: "gender",
        name: "Gender",
        type: "EQUALS",
        values: [{ name: "male", value: "male", queryBindId: "qb-1" }],
        ...overrides,
    };
}

beforeEach(() => {
    setQueryStore([[]]);
});

describe("addItemToQuery", () => {
    test("adds item to an existing group", () => {
        addItemToQuery(makeItem(), 0);
        const store = get(queryStore);
        expect(store[0]).toHaveLength(1);
        expect(store[0][0].name).toBe("Gender");
    });

    test("merges duplicate names in the same group (union of values)", () => {
        addItemToQuery(makeItem(), 0);
        addItemToQuery(
            makeItem({
                id: "id-2",
                values: [
                    { name: "female", value: "female", queryBindId: "qb-2" },
                ],
            }),
            0,
        );
        const store = get(queryStore);
        // Both calls target the same name "Gender" → merged into one item
        expect(store[0]).toHaveLength(1);
        expect(store[0][0].values).toHaveLength(2);
    });

    test("creates a new group when index equals current length", () => {
        addItemToQuery(makeItem(), 1); // group 0 exists, index 1 creates group 1
        const store = get(queryStore);
        expect(store).toHaveLength(2);
        expect(store[1][0].name).toBe("Gender");
    });

    test("clamps negative index to 0", () => {
        addItemToQuery(makeItem(), -5);
        const store = get(queryStore);
        expect(store[0]).toHaveLength(1);
    });

    test("clamps out-of-range index to last possible position", () => {
        addItemToQuery(makeItem(), 99);
        const store = get(queryStore);
        // Group 0 was the only group; a new group was created at index 1
        expect(store).toHaveLength(2);
    });
});

describe("removeValueFromQuery", () => {
    test("removes one value from a multi-value item; item stays", () => {
        const item = makeItem({
            values: [
                { name: "male", value: "male", queryBindId: "qb-1" },
                { name: "female", value: "female", queryBindId: "qb-2" },
            ],
        });
        addItemToQuery(item, 0);

        removeValueFromQuery(
            {
                ...item,
                values: [{ name: "male", value: "male", queryBindId: "qb-1" }],
            },
            0,
        );

        const store = get(queryStore);
        expect(store[0]).toHaveLength(1);
        expect(store[0][0].values).toHaveLength(1);
        expect(store[0][0].values[0].name).toBe("female");
    });

    test("removing the last value of an item removes the item", () => {
        addItemToQuery(makeItem(), 0);
        removeValueFromQuery(makeItem(), 0);

        const store = get(queryStore);
        expect(store[0]).toHaveLength(0);
    });
});

describe("removeItemFromQuery", () => {
    test("removes the item by id", () => {
        const item = makeItem({ id: "remove-me" });
        const other = makeItem({
            id: "keep-me",
            name: "First name",
            key: "first-name",
        });
        addItemToQuery(item, 0);
        addItemToQuery(other, 0);

        removeItemFromQuery(item, 0);

        const store = get(queryStore);
        expect(store[0]).toHaveLength(1);
        expect(store[0][0].id).toBe("keep-me");
    });
});
