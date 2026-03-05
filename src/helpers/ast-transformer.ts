import type { AstNode, OrOperator, AndOperator } from "../types/ast";
import type { Query, QueryItem } from "../types/query";
import { resolveOptionAst } from "../stores/catalogue";
import { get } from "svelte/store";
import { queryStore } from "../stores/query";

/**
 * Convert a QueryItem to an AstNode. SetItems resolve suboptions and
 * custom ast overrides via the catalogue's option map.
 */
function queryItemToAst(item: QueryItem): AstNode {
    let node: AstNode;

    switch (item.type) {
        case "SetItem": {
            if (item.values.length === 1) {
                node = resolveOptionAst(item.key, item.values[0]);
            } else {
                const operands = item.values.map((value) =>
                    resolveOptionAst(item.key, value),
                );
                node = { type: "OrOperator", operands };
            }
            break;
        }
        case "NumericRangeItem":
            node = {
                type: "NumericRangeFilter",
                key: item.key,
                min: item.min,
                max: item.max,
            };
            break;
        case "DateRangeItem":
            node = {
                type: "DateRangeFilter",
                key: item.key,
                min: item.min,
                max: item.max,
            };
            break;
    }

    if (item.negated) {
        return { type: "NotOperator", operand: node };
    }
    return node;
}

/**
 * Build an AST from the query.
 *
 * Query → OrOperator over bars
 *   QueryBar → AndOperator over items
 *     QueryItem → filter node (possibly wrapped in NotOperator)
 */
export function buildAstFromQuery(query: Query): AstNode {
    if (query.bars.length === 1 && query.bars[0].items.length === 0) {
        return { type: "OrOperator", operands: [] } satisfies OrOperator;
    }

    const barNodes: AstNode[] = query.bars
        .filter((bar) => bar.items.length > 0)
        .map((bar) => {
            const itemNodes = bar.items.map(queryItemToAst);
            if (itemNodes.length === 1) return itemNodes[0];
            return {
                type: "AndOperator",
                operands: itemNodes,
            } satisfies AndOperator;
        });

    if (barNodes.length === 0) {
        return { type: "OrOperator", operands: [] } satisfies OrOperator;
    }
    if (barNodes.length === 1) {
        return barNodes[0];
    }
    return { type: "OrOperator", operands: barNodes } satisfies OrOperator;
}

/**
 * Get the AST representing the query that is currently in the search bar.
 */
export function getAst(): AstNode {
    return buildAstFromQuery(get(queryStore));
}
