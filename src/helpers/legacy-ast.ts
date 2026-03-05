import type { AstNode } from "../types/ast";

/**
 * Legacy AST types kept for backwards compatibility. Will be removed
 * once all consumers have migrated to the new AstNode type.
 */

export type AstElement = AstTopLayer | AstBottomLayerValue;

export type AstTopLayer = {
    key?: string;
    operand: "AND" | "OR" | "XOR" | "NOT";
    children: AstElement[];
};

export type AstBottomLayerValue = {
    key: string;
    type: string;
    value:
        | string
        | boolean
        | Array<string>
        | { min?: number; max?: number }
        | { min?: string; max?: string };
};

/**
 * Converts a new-format AstNode to the legacy AST format.
 *
 * Mapping:
 * - AndOperator  → { operand: "AND", children: [...] }
 * - OrOperator   → { operand: "OR", children: [...] }
 * - NotOperator  → { operand: "NOT", children: [child] }
 * - SetFilter    → OR-wrapped AstBottomLayerValue(s) with type "EQUALS"
 * - NumericRangeFilter → AstBottomLayerValue with type "BETWEEN"
 * - DateRangeFilter    → AstBottomLayerValue with type "BETWEEN"
 */
export function convertToLegacyAst(node: AstNode): AstTopLayer {
    switch (node.type) {
        case "AndOperator":
            return {
                operand: "AND",
                children: node.operands.map(convertToLegacyAstElement),
            };
        case "OrOperator":
            return {
                operand: "OR",
                children: node.operands.map(convertToLegacyAstElement),
            };
        case "NotOperator":
            return {
                operand: "NOT",
                children: [convertToLegacyAstElement(node.operand)],
            };
        case "SetFilter": {
            const children: AstBottomLayerValue[] = node.values.map(
                (value) => ({
                    key: node.key,
                    type: "EQUALS",
                    value,
                }),
            );
            return {
                operand: "OR",
                key: node.key,
                children,
            };
        }
        case "NumericRangeFilter":
            return {
                operand: "OR",
                key: node.key,
                children: [
                    {
                        key: node.key,
                        type: "BETWEEN",
                        value: { min: node.min, max: node.max },
                    },
                ],
            };
        case "DateRangeFilter":
            return {
                operand: "OR",
                key: node.key,
                children: [
                    {
                        key: node.key,
                        type: "BETWEEN",
                        value: { min: node.min, max: node.max },
                    },
                ],
            };
    }
}

function convertToLegacyAstElement(node: AstNode): AstElement {
    switch (node.type) {
        case "SetFilter":
        case "NumericRangeFilter":
        case "DateRangeFilter":
            // Leaf filters produce an AstTopLayer wrapper
            return convertToLegacyAst(node);
        default:
            return convertToLegacyAst(node);
    }
}
