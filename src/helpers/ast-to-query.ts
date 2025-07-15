import {
    isTopLayer,
    type AstElement,
    type AstTopLayer,
    isBottomLayer,
    type AstBottomLayerValue,
} from "../types/ast";
import { queryStore } from "../stores/query";
import { v4 as uuidv4 } from "uuid";
import type { QueryItem, QueryValue } from "../types/queryData";
import {
    catalogue,
    getCategoryFromKey,
    getCriteriaFromKey,
} from "../stores/catalogue";
import { get } from "svelte/store";
import type { AggregatedValue } from "../types/catalogue";

/**
 * Sets the query store using the AST representation of a query.
 * @param ast the ast that should be imported
 * @deprecated This function is kept because it is used by OVIS but we discourage its use in new code.
 */
export const setQueryStoreFromAst = (ast: AstTopLayer): void => {
    const query = buildQueryFromAst(ast);
    queryStore.set(query);
};

/**
 * build a query store from an AST
 * @param ast - the AST to transform
 * @returns query
 */
const buildQueryFromAst = (ast: AstTopLayer): QueryItem[][] => {
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
    const criteriaCategory = getCategoryFromKey(get(catalogue), criteria.key!);
    return {
        id: uuidv4(),
        key: criteria.key!,
        name: criteriaCategory != undefined ? criteriaCategory.name : "",
        // NOTE: Assuming hard coding here, proof me wrong
        type: "EQUALS",
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
        name: value.key!,
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
        | { min?: number; max?: number }
        | { min?: string; max?: string }
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
        if ("min" in value.value || "max" in value.value) {
            mappedName =
                value.value.min === undefined
                    ? ` ≤ ${value.value.max}`
                    : value.value.max === undefined
                      ? ` ≥ ${value.value.min}`
                      : ` ${value.value.min} - ${value.value.max}`;
            if (
                (value.value.min === undefined ||
                    typeof value.value.min === "number") &&
                (value.value.max === undefined ||
                    typeof value.value.max === "number")
            ) {
                mappedValue = { min: value.value.min, max: value.value.max };
            } else if (
                (value.value.min === undefined ||
                    typeof value.value.min === "string") &&
                (value.value.max === undefined ||
                    typeof value.value.max === "string")
            ) {
                mappedValue = { min: value.value.min, max: value.value.max };
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
