import type { AstElement, AstTopLayer } from "../types/ast";
import type { QueryItem, queryStoreItem } from "../types/queryData";

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
