import { expect, test } from "vitest";
import { queryItemFromChartValue } from "./chart-click-to-add";
import type { Catalogue } from "../types/catalogue";

const catalogue: Catalogue = [
    {
        fieldType: "autocomplete",
        key: "diagnosis",
        name: "Diagnosis",
        type: "EQUALS",
        criteria: [
            { key: "C31", name: "C31", description: "Accessory sinuses" },
            { key: "C41", name: "C41" },
            { key: "hidden", name: "hidden", visible: false },
            {
                key: "C50",
                name: "C50",
                subgroup: [{ key: "C50.1", name: "Central portion of breast" }],
            },
        ],
    },
    {
        fieldType: "number",
        key: "age",
        name: "Age",
        type: "BETWEEN",
    },
    {
        fieldType: "date",
        key: "date-of-birth",
        name: "Date of birth",
        type: "BETWEEN",
    },
    {
        fieldType: "group",
        key: "outer",
        name: "Outer",
        childCategories: [
            {
                fieldType: "group",
                key: "inner",
                name: "Inner",
                childCategories: [
                    {
                        fieldType: "single-select",
                        key: "gender",
                        name: "Gender",
                        type: "EQUALS",
                        criteria: [
                            { key: "male", name: "Male" },
                            {
                                key: "urn:gliom:1",
                                name: "Gliom - Grad I",
                                aggregatedValue: [
                                    [{ value: "diagnosis", name: "D43.%" }],
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

test("queryItemFromChartValue: category on the top level of the catalogue", () => {
    expect(
        queryItemFromChartValue(catalogue, "diagnosis", "C31"),
    ).toMatchObject({
        key: "diagnosis",
        name: "Diagnosis",
        type: "EQUALS",
        values: [
            {
                name: "C31",
                value: "C31",
                description: "Accessory sinuses",
            },
        ],
    });
});

test("queryItemFromChartValue: category nested three levels deep", () => {
    expect(queryItemFromChartValue(catalogue, "gender", "male")).toMatchObject({
        key: "gender",
        name: "Gender",
        values: [{ name: "Male", value: "male" }],
    });
});

test("queryItemFromChartValue: criterion matched by name", () => {
    expect(
        queryItemFromChartValue(catalogue, "gender", "Gliom - Grad I"),
    ).toMatchObject({
        values: [
            {
                name: "Gliom - Grad I",
                value: [[{ value: "diagnosis", name: "D43.%" }]],
            },
        ],
    });
});

test("queryItemFromChartValue: criterion inside a subgroup", () => {
    expect(
        queryItemFromChartValue(catalogue, "diagnosis", "C50.1"),
    ).toMatchObject({
        key: "diagnosis",
        values: [{ name: "Central portion of breast", value: "C50.1" }],
    });
});

test("queryItemFromChartValue: numeric category without groupRange", () => {
    expect(queryItemFromChartValue(catalogue, "age", "60")).toMatchObject({
        key: "age",
        type: "BETWEEN",
        values: [{ name: "60", value: { min: 60, max: 60 } }],
    });
});

test("queryItemFromChartValue: numeric category with groupRange", () => {
    expect(queryItemFromChartValue(catalogue, "age", "60", 10)).toMatchObject({
        values: [{ name: "60 - 69", value: { min: 60, max: 69 } }],
    });
});

test("queryItemFromChartValue: no match returns undefined", () => {
    // unknown dataKey
    expect(queryItemFromChartValue(catalogue, "nope", "C31")).toBeUndefined();
    // unknown value
    expect(
        queryItemFromChartValue(catalogue, "diagnosis", "C99"),
    ).toBeUndefined();
    // a criterion that is hidden in the catalogue
    expect(
        queryItemFromChartValue(catalogue, "diagnosis", "hidden"),
    ).toBeUndefined();
    // a category that cannot be filled from a single value
    expect(
        queryItemFromChartValue(catalogue, "date-of-birth", "2020-01-01"),
    ).toBeUndefined();
    // a numeric category with a value that is not a number
    expect(
        queryItemFromChartValue(catalogue, "age", "unknown"),
    ).toBeUndefined();
    // the empty catalogue
    expect(queryItemFromChartValue([], "diagnosis", "C31")).toBeUndefined();
});
