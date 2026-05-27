import { beforeEach, describe, expect, test } from "vitest";
import { get } from "svelte/store";
import {
    getHumanReadableQueryAsFormattedString,
    getParsedStringItem,
} from "../stores/datarequests";
import { queryStore, setQueryStore } from "../stores/query";
import type { QueryItem } from "../types/queryData";

function makeItem(name: string, values: { name: string; value: string }[]): QueryItem {
    return {
        id: "test-id",
        key: name.toLowerCase().replace(/\s/g, "-"),
        name,
        type: "EQUALS",
        values: values.map((v, i) => ({
            ...v,
            queryBindId: `qb-${i}`,
        })),
    };
}

beforeEach(() => {
    setQueryStore([[]]);
});

describe("getParsedStringItem", () => {
    test("formats a single string value as 'Name: value'", () => {
        const item = makeItem("First name", [{ name: "Olaf", value: "Olaf" }]);
        expect(getParsedStringItem(item, false)).toBe("First name: Olaf");
    });

    test("joins multiple string values with a comma", () => {
        const item = makeItem("Gender", [
            { name: "male", value: "male" },
            { name: "female", value: "female" },
        ]);
        expect(getParsedStringItem(item, false)).toBe("Gender: male, female");
    });
});

describe("getHumanReadableQueryAsFormattedString", () => {
    test("returns empty string for an empty query", () => {
        expect(getHumanReadableQueryAsFormattedString()).toBe("");
    });

    test("1-group query contains the group header and the filter", () => {
        setQueryStore([
            [makeItem("First name", [{ name: "Olaf", value: "Olaf" }])],
        ]);
        const result = getHumanReadableQueryAsFormattedString();
        expect(result).toContain("Search ANY of the following groups");
        // translate("query_info_group_header") + " 1" → "Group 1"
        expect(result).toContain("Group 1");
        expect(result).toContain("First name: Olaf");
    });

    test("2-group OR query contains both group headers and their filters", () => {
        setQueryStore([
            [makeItem("First name", [{ name: "Olaf", value: "Olaf" }])],
            [makeItem("Gender", [{ name: "male", value: "male" }])],
        ]);
        const result = getHumanReadableQueryAsFormattedString();
        expect(result).toContain("Group 1");
        expect(result).toContain("Group 2");
        expect(result).toContain("First name: Olaf");
        expect(result).toContain("Gender: male");
    });

    test("AND within a group lists all items under the same group number", () => {
        setQueryStore([
            [
                makeItem("First name", [{ name: "Olaf", value: "Olaf" }]),
                makeItem("Gender", [{ name: "male", value: "male" }]),
            ],
        ]);
        const result = getHumanReadableQueryAsFormattedString();
        expect(result).toContain("Group 1");
        expect(result).not.toContain("Group 2");
        expect(result).toContain("First name: Olaf");
        expect(result).toContain("Gender: male");
    });
});
