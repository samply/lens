import { v4 as uuidv4 } from "uuid";
import {
    isTopLayer,
    type AstElement,
    type AstTopLayer,
    isBottomLayer,
    type AstBottomLayerValue,
} from "../types/ast";
import type { QueryItem, QueryValue, queryStoreItem } from "../types/queryData";
import type { AggregatedValue } from "../../../../dist/types";
import {
    catalogue,
    getCategoryFromKey,
    getCriteriaFromKey,
} from "../stores/catalogue";
import { get } from "svelte/store";

/**
 * builds an AST from the query store
 * @param queryStore - the query store
 * @returns Ast: the AST will later be converted to a query language of choice
 */
export const buildAstFromQuery = (queryStore: QueryItem[][]): AstTopLayer => {
    const ast: AstTopLayer = returnNestedValues(queryStore) as AstTopLayer;

    if (ast.children.length === 1 && ast.children[0] === null) {
        return {
            operand: "OR",
            children: [],
        };
    }

    return ast;
};

/**
 * build a query store from an AST
 * @param ast - the AST to transform
 * @returns query
 */
export const buildQueryFromAst = (ast: AstTopLayer): QueryItem[][] => {
    return divideQueries(ast);
};

/**
 * split the top level ast into the multiple OR connected queries
 * @param queries - the whole AST to transform
 * @returns array of different queries
 */
const divideQueries = (queries: AstTopLayer): QueryItem[][] => {
    return queries.children.map((child) => divideCriterias(child));
};

/**
 * divide a query into all different criteria
 * NOTE: at the moment we don't expect a AstBottomLayer here, because we always have a logical AND between the criterias of a query
 * @param query - a single query consiting of multiple criteria
 * @returns a single query in the internal representation
 */
const divideCriterias = (query: AstElement): QueryItem[] => {
    if (isTopLayer(query)) {
        const criterias = query.children
            .filter((child) => isTopLayer(child))
            .map((child) => convertCriteria(<AstTopLayer>child));
        return criterias != undefined ? <QueryItem[]>criterias : [];
    } else {
        return [];
    }
};

/**
 * convert a query criteria to it's internal query item representation
 * NOTE: we have two cases here: 1) normal criteria represented as AstBottomLayerValue 2) complex criteria represented as an AstTopLayer
 * @param criteria - a single query criteria
 * @returns the internal QueryItem representation of this criteria
 */
const convertCriteria = (criteria: AstTopLayer): QueryItem | undefined => {
    const values = criteria.children.filter((child) => isBottomLayer(child));
    if (values.length === 0) return convertComplexCriteria(criteria);
    const checkedValues: AstBottomLayerValue[] = <AstBottomLayerValue[]>values;
    const convertedValues = convertValues(checkedValues);
    const catalogueCategory = getCategoryFromKey(
        get(catalogue),
        checkedValues[0].key,
    );
    const convertedCriteria: QueryItem = {
        id: uuidv4(),
        key: checkedValues[0].key,
        name: catalogueCategory != undefined ? catalogueCategory.name : "",
        type: checkedValues[0].type,
        system: checkedValues[0].system,
        values: convertedValues,
    };
    if (catalogueCategory != undefined && "description" in catalogueCategory) {
        convertedCriteria.description = catalogueCategory.description;
    }
    return convertedCriteria;
};

/**
 * convert a query criteria based on an AstTopLayer to it's internal representation
 * @param criteria - an AstTopLayer based criteria
 * @returns the internal QueryItem representation of this criteria
 */
const convertComplexCriteria = (criteria: AstTopLayer): QueryItem => {
    const values = criteria.children.filter((child) => isTopLayer(child));
    const checkedValues: AstTopLayer[] = <AstTopLayer[]>values;
    const convertedValues = convertValues(checkedValues);
    const criteriaCateogory = getCategoryFromKey(get(catalogue), criteria.key);
    return {
        id: uuidv4(),
        key: criteria.key,
        name: criteriaCateogory != undefined ? criteriaCateogory.name : "",
        // NOTE: Assuming hard coding here, proof me wrong
        type: "EQUALS",
        description:
            criteriaCateogory != undefined && "description" in criteriaCateogory
                ? criteriaCateogory.description
                : "",
        system: "",
        values: convertedValues,
    };
};

const convertValues = (values: AstElement[]): QueryValue[] => {
    return values.map((value) => convertValue(value));
};

const convertValue = (value: AstElement): QueryValue => {
    if (isBottomLayer(value)) {
        return convertBottomLayerValue(value);
    } else {
        return convertTopLayerValue(value);
    }
};

/**
 * converts the values of an AstTopLayer criteria
 * @param value - the AstTopLayer
 * @returns a QueryValue
 */
const convertTopLayerValue = (value: AstTopLayer): QueryValue => {
    const values = value.children
        .map((orArray) => {
            if (isTopLayer(orArray)) {
                const result = orArray.children.map((andValue) => {
                    if (isBottomLayer(andValue)) {
                        return {
                            name: andValue.key,
                            value: andValue.value.toString(),
                        };
                    }
                });
                const filteredResult = result.filter(
                    (value) => value !== undefined,
                );
                return <AggregatedValue[]>filteredResult;
            }
        })
        .filter((value) => value != undefined);
    return {
        queryBindId: uuidv4(),
        name: value.key,
        value: <AggregatedValue[][]>values,
    };
};

/**
 * converts the values of an AstBottomLayerValue criteria
 * @param value - the AstBottomLayerValue
 * @returns a QueryValue
 */
const convertBottomLayerValue = (value: AstBottomLayerValue): QueryValue => {
    let mappedName: string = `Combination ${value.key} and ${value.value} is not mapped!`;
    let mappedValue:
        | string
        | { min: number; max: number }
        | AggregatedValue[][] =
        "WARNING: This value was not processed by convertValue function!";

    if (typeof value.value === "string") {
        const criteria = getCriteriaFromKey(
            get(catalogue),
            value.key,
            value.value,
        );
        mappedName = criteria != undefined ? criteria.name : "";
        mappedValue = value.value;
    } else if (typeof value.value === "boolean") {
        mappedValue = value.value.toString();
    } else if (typeof value.value === "object") {
        if ("min" in value.value && "max" in value.value) {
            mappedName =
                value.value.min === 0
                    ? ` ≤ ${value.value.max}`
                    : value.value.max === 0
                      ? ` ≥ ${value.value.min}`
                      : ` ${value.value.min} - ${value.value.max}`;
            if (
                typeof value.value.min === "number" &&
                typeof value.value.max === "number"
            ) {
                mappedValue = { min: value.value.min, max: value.value.max };
            } else if (
                typeof value.value.min === "string" &&
                typeof value.value.max === "string"
            ) {
                const minDate = new Date(value.value.min);
                const maxDate = new Date(value.value.min);
                mappedValue = {
                    min: minDate.getDate(),
                    max: maxDate.getDate(),
                };
            }
        } else {
            mappedValue =
                "TODO: This is the not mapped Array<string> case for value";
        }
    }
    return {
        queryBindId: uuidv4(),
        name: mappedName,
        value: mappedValue,
    };
};

/**
 * recursive function to return nested values of the query store as AST children
 * @param item - the current item of the query store
 * @param operand - the operand of the top layer
 * @param topLayerItem - the next higher layer of the query store. Used to get the key, type and system of the current item
 * @returns AstElement
 */
export const returnNestedValues = (
    item: queryStoreItem | QueryItem[][],
    operand?: "AND" | "OR",
    topLayerItem?: queryStoreItem | QueryItem[][],
): AstElement => {
    /**
     * sets the operand for the current layer
     * starts with 'OR' from the top layer and switches to the opposite each layer
     */
    operand = operand === "OR" ? "AND" : "OR";

    /**
     * handles first layer of the store (QueryItem[])
     * or entities (aggregatedValue)
     */
    if (Array.isArray(item)) {
        return {
            operand: operand,
            children: item.map((value) => {
                return returnNestedValues(value, operand, item);
            }),
        };
    }

    /**
     * handles second layer of the store (queryItem)
     */
    if ("values" in item && Array.isArray(item.values)) {
        return {
            key: item.key,
            operand: operand,
            children: item.values.map((value) => {
                return returnNestedValues(value, operand, item);
            }),
        };
    }

    /**
     * handles the third layer of store when the value of the QueryItem is an entity (aggregatedValue)
     */
    if ("value" in item && Array.isArray(item.value)) {
        return {
            key: item.name,
            operand: operand,
            children: item.value.map((value) => {
                return returnNestedValues(value, operand, item);
            }),
        };
    }

    /**
     * return bottom level object of other QueryValues (string | {min: number, max: number})
     */
    if (
        "value" in item &&
        topLayerItem !== undefined &&
        "key" in topLayerItem &&
        !Array.isArray(item.value)
    ) {
        return {
            key: topLayerItem.key,
            type: topLayerItem.type,
            system: topLayerItem.system || "",
            value: item.value,
        };
    }

    /**
     * return bottom level object of an entity (aggregatedValue)
     */
    if ("value" in item && typeof item.value === "string") {
        return {
            key: item.value,
            type: "EQUALS",
            system: "",
            value: item.name,
        };
    }

    throw "This should be unreachable";
};
