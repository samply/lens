/* eslint-disable @typescript-eslint/no-explicit-any */
export type AstElement = AstTopLayer | AstBottomLayerValue;
export const isTopLayer = (x: AstElement): x is AstTopLayer => "operand" in x;
export const isBottomLayer = (x: AstElement): x is AstBottomLayerValue =>
    "value" in x;

// TODO: Split this into two types, one with mandatory `key` and one without
export type AstTopLayer = {
    nodeType: "branch";
    key?: string;
    operand: "AND" | "OR";
    children: AstElement[];
};

export type AstBottomLayerValue = {
    nodeType: "leaf";
    key: string;
    type: string;
    system?: string;
    value:
        | string
        | boolean
        | Array<string>
        | { min: number; max: number }
        | { min: string; max: string }; // for dates
};
