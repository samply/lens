import { writable, derived, get } from "svelte/store";
import type {
    LensCatalogue,
    CatalogueElement,
    CatalogueOption,
    AggregatedValue,
} from "../types/catalogue";
import type { AstNode } from "../types/ast";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import catalogueSchema from "../../schema/catalogue.schema.json";

export const catalogue = writable<LensCatalogue>([]);

/**
 * Flattened element map: element.key → CatalogueElement.
 * Built lazily from the catalogue store.
 */
export const elementMap = derived<
    typeof catalogue,
    Map<string, CatalogueElement>
>(catalogue, ($catalogue) => {
    const map = new Map<string, CatalogueElement>();
    const visit = (node: CatalogueElement): void => {
        if (node.type === "CatalogueGroup") {
            for (const child of node.elements) visit(child);
        } else {
            map.set(node.key, node);
        }
    };
    for (const node of $catalogue) visit(node);
    return map;
});

/**
 * Flattened option map: "${elementKey}.${option.value}" → CatalogueOption.
 * Built lazily from the catalogue store.
 */
export const optionMap = derived<
    typeof catalogue,
    Map<string, CatalogueOption>
>(catalogue, ($catalogue) => {
    const map = new Map<string, CatalogueOption>();
    const visitOptions = (elementKey: string, options: CatalogueOption[]) => {
        for (const option of options) {
            map.set(`${elementKey}.${option.value}`, option);
            if (option.suboptions) {
                visitOptions(elementKey, option.suboptions);
            }
        }
    };
    const visitElement = (node: CatalogueElement): void => {
        if (node.type === "CatalogueGroup") {
            for (const child of node.elements) visitElement(child);
        } else if (
            node.type === "SelectElement" ||
            node.type === "AutocompleteElement"
        ) {
            visitOptions(node.key, node.options);
        }
    };
    for (const node of $catalogue) visitElement(node);
    return map;
});

/**
 * Collect all leaf option values for suboptions of a given option.
 * If the option has suboptions, recursively collect all leaf values.
 * Otherwise return the option's own value.
 */
function collectLeafValues(option: CatalogueOption): string[] {
    if (option.suboptions && option.suboptions.length > 0) {
        return option.suboptions.flatMap(collectLeafValues);
    }
    return [option.value];
}

function aggregatedValueEntryToAst(entry: AggregatedValue): AstNode {
    return {
        type: "SetFilter",
        key: entry.key,
        values: [entry.value],
    };
}

function aggregatedValueToAst(aggregatedValue: AggregatedValue[][]): AstNode {
    const andOperands: AstNode[] = aggregatedValue
        .map((orGroup) => {
            if (orGroup.length === 0) {
                return undefined;
            }
            const orOperands = orGroup.map(aggregatedValueEntryToAst);
            if (orOperands.length === 1) {
                return orOperands[0];
            }
            return {
                type: "OrOperator",
                operands: orOperands,
            } satisfies AstNode;
        })
        .filter((operand): operand is AstNode => operand !== undefined);

    if (andOperands.length === 1) {
        return andOperands[0];
    }

    return {
        type: "AndOperator",
        operands: andOperands,
    };
}

/**
 * Resolve the AST for a selected option value.
 * If the option has `aggregatedValue`, expand it to AST.
 * If the option has suboptions, expand into a SetFilter of leaf values.
 * Otherwise return a simple SetFilter with the single value.
 */
export function resolveOptionAst(
    elementKey: string,
    optionValue: string,
): AstNode {
    const option = get(optionMap).get(`${elementKey}.${optionValue}`);
    if (option?.aggregatedValue && option.aggregatedValue.length > 0) {
        return aggregatedValueToAst(option.aggregatedValue);
    }
    if (option?.suboptions && option.suboptions.length > 0) {
        const leafValues = collectLeafValues(option);
        return { type: "SetFilter", key: elementKey, values: leafValues };
    }
    return { type: "SetFilter", key: elementKey, values: [optionValue] };
}

export const openTreeNodes = writable<
    Map<string, { key: string; opened: boolean }>
>(new Map());

/**
 * Get all option values for a catalogue element identified by key.
 * Recursively collects values from suboptions.
 */
export const getOptionValues = (elementKey: string): string[] => {
    const element = get(elementMap).get(elementKey);
    if (!element) return [];
    if (
        element.type === "SelectElement" ||
        element.type === "AutocompleteElement"
    ) {
        const collectValues = (options: CatalogueOption[]): string[] => {
            const values: string[] = [];
            for (const opt of options) {
                values.push(opt.value);
                if (opt.suboptions) {
                    values.push(...collectValues(opt.suboptions));
                }
            }
            return values;
        };
        return collectValues(element.options);
    }
    return [];
};

/**
 * Validate the catalogue for duplicate element keys and duplicate option values
 * within the same element.
 */
function validateCatalogue(cat: LensCatalogue): string[] {
    const errors: string[] = [];
    const seenKeys = new Set<string>();
    const visitElement = (node: CatalogueElement) => {
        if (node.type === "CatalogueGroup") {
            for (const child of node.elements) visitElement(child);
            return;
        }
        if (seenKeys.has(node.key)) {
            errors.push(`Duplicate element key: "${node.key}"`);
        }
        seenKeys.add(node.key);
        if (
            node.type === "SelectElement" ||
            node.type === "AutocompleteElement"
        ) {
            const seenValues = new Set<string>();
            const visitOpt = (opt: CatalogueOption) => {
                if (seenValues.has(opt.value)) {
                    errors.push(
                        `Duplicate option value "${opt.value}" in element "${node.key}"`,
                    );
                }
                seenValues.add(opt.value);
                if (opt.suboptions) {
                    for (const sub of opt.suboptions) visitOpt(sub);
                }
            };
            for (const opt of node.options) visitOpt(opt);
        }
    };
    for (const node of cat) visitElement(node);
    return errors;
}

/**
 * Set the catalogue. Validates against JSON schema and checks for duplicate
 * keys/values. Note that the function makes a deep copy of the catalogue so
 * modifying the original object has no effect.
 */
export function setCatalogue(newCatalogue: LensCatalogue) {
    const catalogueCopy = structuredClone(newCatalogue);
    const ajv = new Ajv({
        allErrors: true,
        removeAdditional: true,
    });
    addFormats(ajv);
    const valid = ajv.validate(catalogueSchema, catalogueCopy);
    if (!valid) {
        console.warn(
            "Catalogue does not conform with JSON schema: " +
                JSON.stringify(ajv.errors),
        );
    }
    const validationErrors = validateCatalogue(catalogueCopy);
    if (validationErrors.length > 0) {
        throw new Error("Invalid catalogue:\n" + validationErrors.join("\n"));
    }
    catalogue.set(catalogueCopy);
}

/** Returns the current catalogue from the store. */
export function getCatalogue(): LensCatalogue {
    return get(catalogue);
}
