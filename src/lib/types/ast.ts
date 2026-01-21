export type AstElement = AstTopLayer | AstBottomLayerValue;
export const isTopLayer = (x: AstElement): x is AstTopLayer => "operand" in x;
export const isBottomLayer = (x: AstElement): x is AstBottomLayerValue =>
    "value" in x;

// TODO: Split this into two types, one with mandatory `key` and one without
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
        | { min?: number; max?: number } // For numeric ranges
        | { min?: string; max?: string }; // For date ranges
};
