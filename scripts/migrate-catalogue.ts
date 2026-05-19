/**
 * Converts an old-format Lens catalogue JSON to the new format.
 *
 * Usage:
 *   node scripts/migrate-catalogue.ts < old-catalogue.json > new-catalogue.json
 *   node scripts/migrate-catalogue.ts old-catalogue.json > new-catalogue.json
 */

import { readFileSync } from "fs";

// ---------------------------------------------------------------------------
// Old catalogue types (kept here so they live only in this script)
// ---------------------------------------------------------------------------

type OldCatalogue = OldCategory[];

type OldCategory =
    | OldCategoryGroup
    | OldSingleSelectCategory
    | OldAutocompleteCategory
    | OldNumericRangeCategory
    | OldDateRangeCategory
    | OldStringCategory;

type OldCategoryGroup = {
    fieldType: "group";
    key: string;
    name: string;
    childCategories: OldCategory[];
    infoButtonText?: string[];
    infoLink?: { link: string; display: string };
};

type OldSingleSelectCategory = {
    fieldType: "single-select";
    key: string;
    name: string;
    type: string;
    criteria: OldCriteria[];
    infoButtonText?: string[];
    subCategoryName?: string;
    domains?: string[];
};

type OldAutocompleteCategory = {
    fieldType: "autocomplete";
    key: string;
    name: string;
    type: string;
    criteria: OldCriteria[];
    infoButtonText?: string[];
    domains?: string[];
};

type OldNumericRangeCategory = {
    fieldType: "number";
    key: string;
    name: string;
    type: string;
    min?: number;
    max?: number;
    infoButtonText?: string[];
    unitText?: string;
    domains?: string[];
};

type OldDateRangeCategory = {
    fieldType: "date";
    key: string;
    name: string;
    type: string;
    min?: string;
    max?: string;
    infoButtonText?: string[];
    domains?: string[];
};

type OldStringCategory = {
    fieldType: "string";
    key: string;
    name: string;
    type: string;
    infoButtonText?: string[];
    domains?: string[];
};

type OldCriteria = {
    visible?: boolean;
    key: string;
    name: string;
    description?: string;
    aggregatedValue?: OldAggregatedValue[][];
    subgroup?: OldCriteria[];
};

type OldAggregatedValue = {
    value: string;
    name: string;
};

// ---------------------------------------------------------------------------
// New catalogue types (mirrors src/types/catalogue.ts)
// ---------------------------------------------------------------------------

type NewCatalogueElement =
    | NewCatalogueGroup
    | NewSelectElement
    | NewAutocompleteElement
    | NewNumericRangeElement
    | NewDateRangeElement
    | NewFreeTextElement;

type NewCatalogueGroup = {
    type: "CatalogueGroup";
    name: string;
    elements: NewCatalogueElement[];
    infoButtonText?: string[];
    infoLink?: { link: string; display: string };
};

type NewSelectElement = {
    type: "SelectElement";
    key: string;
    name: string;
    options: NewCatalogueOption[];
    infoButtonText?: string[];
    domains?: string[];
};

type NewAutocompleteElement = {
    type: "AutocompleteElement";
    key: string;
    name: string;
    options: NewCatalogueOption[];
    infoButtonText?: string[];
    domains?: string[];
};

type NewNumericRangeElement = {
    type: "NumericRangeElement";
    key: string;
    name: string;
    min?: number;
    max?: number;
    infoButtonText?: string[];
    unitText?: string;
    domains?: string[];
};

type NewDateRangeElement = {
    type: "DateRangeElement";
    key: string;
    name: string;
    min?: string;
    max?: string;
    infoButtonText?: string[];
    domains?: string[];
};

type NewFreeTextElement = {
    type: "FreeTextElement";
    key: string;
    name: string;
    infoButtonText?: string[];
    domains?: string[];
};

type NewAggregatedValue = {
    key: string;
    value: string;
};

type NewCatalogueOption = {
    value: string;
    name: string;
    description?: string;
    selectable?: boolean;
    aggregatedValue?: NewAggregatedValue[][];
    suboptions?: NewCatalogueOption[];
};

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

function convertAggregatedValue(
    agg: OldAggregatedValue[][],
): NewAggregatedValue[][] | undefined {
    if (!agg || agg.length === 0) return undefined;

    return agg.map((orGroup) =>
        orGroup.map((item) => ({
            key: item.value,
            value: item.name,
        })),
    );
}

function convertCriteria(criterion: OldCriteria): NewCatalogueOption {
    const option: NewCatalogueOption = {
        value: criterion.key,
        name: criterion.name,
    };

    if (criterion.description !== undefined) {
        option.description = criterion.description;
    }

    if (criterion.visible !== undefined) {
        option.selectable = criterion.visible;
    }

    if (criterion.aggregatedValue) {
        const aggregatedValue = convertAggregatedValue(
            criterion.aggregatedValue,
        );
        if (aggregatedValue) {
            option.aggregatedValue = aggregatedValue;
        } else {
            console.warn(
                `Warning: Could not convert aggregatedValue for criterion "${criterion.key}"`,
            );
        }
    }

    if (criterion.subgroup && criterion.subgroup.length > 0) {
        option.suboptions = criterion.subgroup.map(convertCriteria);
    }

    return option;
}

/**
 * Merge multiple old single-select categories with the same key
 * (differentiated by subCategoryName) into one SelectElement with
 * suboptions per subCategoryName group.
 */
function mergeSubCategoryEntries(
    entries: OldSingleSelectCategory[],
): NewSelectElement {
    const first = entries[0];

    if (entries.length === 1 && !first.subCategoryName) {
        return {
            type: "SelectElement",
            key: first.key,
            name: first.name,
            ...(first.infoButtonText && {
                infoButtonText: first.infoButtonText,
            }),
            ...(first.domains && { domains: first.domains }),
            options: first.criteria.map(convertCriteria),
        };
    }

    const options: NewCatalogueOption[] = entries.map((entry) => ({
        value: entry.subCategoryName ?? entry.name,
        name: entry.subCategoryName ?? entry.name,
        suboptions: entry.criteria.map(convertCriteria),
    }));

    return {
        type: "SelectElement",
        key: first.key,
        name: first.name,
        ...(first.infoButtonText && { infoButtonText: first.infoButtonText }),
        ...(first.domains && { domains: first.domains }),
        options,
    };
}

function convertCategory(category: OldCategory): NewCatalogueElement {
    switch (category.fieldType) {
        case "group": {
            const elements = convertCategories(category.childCategories);
            const result: NewCatalogueGroup = {
                type: "CatalogueGroup",
                name: category.name,
                ...(category.infoButtonText && {
                    infoButtonText: category.infoButtonText,
                }),
                ...(category.infoLink && { infoLink: category.infoLink }),
                elements,
            };
            return result;
        }
        case "single-select":
            return {
                type: "SelectElement",
                key: category.key,
                name: category.name,
                ...(category.infoButtonText && {
                    infoButtonText: category.infoButtonText,
                }),
                ...(category.domains && { domains: category.domains }),
                options: category.criteria.map(convertCriteria),
            };
        case "autocomplete":
            return {
                type: "AutocompleteElement",
                key: category.key,
                name: category.name,
                ...(category.infoButtonText && {
                    infoButtonText: category.infoButtonText,
                }),
                ...(category.domains && { domains: category.domains }),
                options: category.criteria.map(convertCriteria),
            };
        case "number": {
            const result: NewNumericRangeElement = {
                type: "NumericRangeElement",
                key: category.key,
                name: category.name,
            };
            if (category.min !== undefined) result.min = category.min;
            if (category.max !== undefined) result.max = category.max;
            if (category.infoButtonText)
                result.infoButtonText = category.infoButtonText;
            if (category.unitText) result.unitText = category.unitText;
            if (category.domains) result.domains = category.domains;
            return result;
        }
        case "date": {
            const result: NewDateRangeElement = {
                type: "DateRangeElement",
                key: category.key,
                name: category.name,
            };
            if (category.min !== undefined) result.min = category.min;
            if (category.max !== undefined) result.max = category.max;
            if (category.infoButtonText)
                result.infoButtonText = category.infoButtonText;
            if (category.domains) result.domains = category.domains;
            return result;
        }
        case "string":
            return {
                type: "FreeTextElement",
                key: category.key,
                name: category.name,
                ...(category.infoButtonText && {
                    infoButtonText: category.infoButtonText,
                }),
                ...(category.domains && { domains: category.domains }),
            };
    }
}

/**
 * Convert a list of old categories, merging single-select entries
 * that share the same key (subCategoryName pattern).
 */
function convertCategories(categories: OldCategory[]): NewCatalogueElement[] {
    const results: NewCatalogueElement[] = [];
    const singleSelectByKey = new Map<string, OldSingleSelectCategory[]>();

    for (const category of categories) {
        if (
            category.fieldType === "single-select" &&
            category.subCategoryName
        ) {
            const existing = singleSelectByKey.get(category.key);
            if (existing) {
                existing.push(category);
            } else {
                singleSelectByKey.set(category.key, [category]);
            }
        } else if (category.fieldType === "group") {
            results.push(convertCategory(category));
        } else {
            results.push(convertCategory(category));
        }
    }

    for (const entries of singleSelectByKey.values()) {
        results.push(mergeSubCategoryEntries(entries));
    }

    return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
    let input: string;

    if (process.argv[2]) {
        input = readFileSync(process.argv[2], "utf-8");
    } else {
        input = readFileSync("/dev/stdin", "utf-8");
    }

    let oldCatalogue: OldCatalogue;
    try {
        oldCatalogue = JSON.parse(input);
    } catch {
        console.error("Error: Input is not valid JSON");
        process.exit(1);
    }

    if (!Array.isArray(oldCatalogue)) {
        console.error("Error: Input is not an array");
        process.exit(1);
    }

    const newCatalogue = convertCategories(oldCatalogue);

    console.log(JSON.stringify(newCatalogue, null, 2));
}

main();
