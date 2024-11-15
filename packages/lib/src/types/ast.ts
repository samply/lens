export type AstElement = AstTopLayer | AstBottomLayerValue;
export const isTopLayer = (x: AstElement): x is AstTopLayer => "operand" in x;
export const isBottomLayer = (x: AstElement): x is AstBottomLayerValue =>
    "value" in x;

export type AstTopLayer = {
    key: string;
    operand: "AND" | "OR";
    children: AstElement[];
};

export type AstBottomLayerValue = {
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
