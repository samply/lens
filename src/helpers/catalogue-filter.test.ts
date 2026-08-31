import { expect, test } from "vitest";
import {
    addOpenNodes,
    searchCatalogue,
    type OpenTreeNodes,
} from "./catalogue-filter";
import type { Catalogue, SingleSelectCategory } from "../types/catalogue";

const diagnosis: SingleSelectCategory = {
    fieldType: "single-select",
    key: "diagnosis",
    name: "ICD-10",
    type: "EQUALS",
    criteria: [
        {
            key: "C49",
            name: "C49",
            description: "Bösartige Neubildung des Bindegewebes",
            subgroup: [
                {
                    key: "C49.1",
                    name: "C49.1",
                    description: "Rhabdomyosarkom des Armes",
                },
            ],
        },
        {
            key: "C50",
            name: "C50",
            description: "Brustkrebs",
        },
        {
            key: "C99",
            name: "C99",
            description: "Rhabdomyosarkom, versteckt",
            visible: false,
        },
    ],
};

const catalogue: Catalogue = [
    {
        fieldType: "group",
        key: "patient",
        name: "Tumorentität",
        childCategories: [diagnosis],
    },
];

test("searchCatalogue: matches the description only", () => {
    expect(searchCatalogue(catalogue, "Brustkrebs")).toEqual([
        {
            categoryKey: "diagnosis",
            name: "C50",
            description: "Brustkrebs",
            criterionKey: "C50",
            chain: [
                { key: "patient", subCategoryName: null, name: "Tumorentität" },
                { key: "diagnosis", subCategoryName: null, name: "ICD-10" },
            ],
        },
    ]);
});

test("searchCatalogue: ignores case and accents", () => {
    expect(searchCatalogue(catalogue, "bosartige")[0].criterionKey).toBe("C49");
    expect(searchCatalogue(catalogue, "BÖSARTIGE")[0].criterionKey).toBe("C49");
    expect(searchCatalogue(catalogue, "tumorentitat")[0].name).toBe(
        "Tumorentität",
    );
});

test("searchCatalogue: matches the criterion key", () => {
    expect(searchCatalogue(catalogue, "C50")[0].criterionKey).toBe("C50");
});

test("searchCatalogue: a match in a subgroup folds into the parent criterion", () => {
    const matches = searchCatalogue(catalogue, "Rhabdomyosarkom");
    expect(matches.map((match) => match.criterionKey)).toEqual(["C49"]);
});

test("searchCatalogue: skips criteria that are not visible", () => {
    expect(searchCatalogue(catalogue, "versteckt")).toEqual([]);
});

test("searchCatalogue: an autocomplete criterion carries its key too", () => {
    const autocomplete: Catalogue = [
        { ...diagnosis, fieldType: "autocomplete" },
    ];
    const match = searchCatalogue(autocomplete, "Brustkrebs")[0];

    expect(match.name).toBe("C50");
    expect(match.criterionKey).toBe("C50");
});

test("searchCatalogue: a category match has no criterion", () => {
    expect(searchCatalogue(catalogue, "ICD-10")).toEqual([
        {
            categoryKey: "diagnosis",
            name: "ICD-10",
            chain: [
                { key: "patient", subCategoryName: null, name: "Tumorentität" },
                { key: "diagnosis", subCategoryName: null, name: "ICD-10" },
            ],
        },
    ]);
});

test("searchCatalogue: the chain names a subCategoryName", () => {
    const withSubCategory: Catalogue = [
        { ...diagnosis, subCategoryName: "Main diagnosis" },
    ];

    expect(searchCatalogue(withSubCategory, "Brustkrebs")[0].chain).toEqual([
        {
            key: "diagnosis",
            subCategoryName: "Main diagnosis",
            name: "Main diagnosis",
        },
    ]);
});

test("searchCatalogue: returns nothing for a short term or without a match", () => {
    expect(searchCatalogue(catalogue, "C")).toEqual([]);
    expect(searchCatalogue(catalogue, "  ")).toEqual([]);
    expect(searchCatalogue(catalogue, "Erdbeere")).toEqual([]);
});

test("searchCatalogue: stops at the limit", () => {
    expect(searchCatalogue(catalogue, "C", 1)).toEqual([]);
    expect(searchCatalogue(catalogue, "C4", 1)).toHaveLength(1);
    expect(searchCatalogue(catalogue, "malignant neoplasm", 1)).toEqual([]);
});

test("addOpenNodes: opens a chain", () => {
    const openTreeNodes: OpenTreeNodes = new Map();

    addOpenNodes(
        openTreeNodes,
        searchCatalogue(catalogue, "Brustkrebs")[0].chain,
    );

    expect(openTreeNodes).toEqual(
        new Map([
            ["patient", { key: "patient", subCategoryNames: null }],
            ["diagnosis", { key: "diagnosis", subCategoryNames: null }],
        ]),
    );
});

test("addOpenNodes: keeps the nodes that are already open", () => {
    const openTreeNodes: OpenTreeNodes = new Map([
        ["blood-group", { key: "blood-group", subCategoryNames: null }],
        ["diagnosis", { key: "diagnosis", subCategoryNames: ["Secondary"] }],
    ]);

    addOpenNodes(openTreeNodes, [
        { key: "diagnosis", subCategoryName: "Main", name: "Main" },
    ]);

    expect(openTreeNodes.get("blood-group")).toEqual({
        key: "blood-group",
        subCategoryNames: null,
    });
    expect(openTreeNodes.get("diagnosis")).toEqual({
        key: "diagnosis",
        subCategoryNames: ["Secondary", "Main"],
    });
});
