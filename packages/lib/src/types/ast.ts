/* eslint-disable @typescript-eslint/no-explicit-any */
export type AstElement = AstTopLayer | AstBottomLayerValue;

export type AstTopLayer = {
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
// Type Guards

/**
 * Checks if the given object conforms to the AstBottomLayerValue type.
 * @param obj - The object to check.
 * @returns True if the object matches the AstBottomLayerValue type, otherwise false.
 */
export function isAstBottomLayerValue(obj: any): obj is AstBottomLayerValue {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.key === "string" &&
        typeof obj.type === "string" &&
        (obj.system === undefined || typeof obj.system === "string") &&
        (typeof obj.value === "string" ||
            typeof obj.value === "boolean" ||
            (Array.isArray(obj.value) &&
                obj.value.every((v) => typeof v === "string")) ||
            (typeof obj.value === "object" &&
                obj.value !== null &&
                (("min" in obj.value &&
                    typeof obj.value.min === "number" &&
                    "max" in obj.value &&
                    typeof obj.value.max === "number") ||
                    ("min" in obj.value &&
                        typeof obj.value.min === "string" &&
                        "max" in obj.value &&
                        typeof obj.value.max === "string"))))
    );
}

/**
 * Checks if the given object conforms to the AstTopLayer type.
 * @param obj - The object to check.
 * @returns True if the object matches the AstTopLayer type, otherwise false.
 */
export function isAstTopLayer(obj: any): obj is AstTopLayer {
    return (
        typeof obj === "object" &&
        obj !== null &&
        (obj.operand === "AND" || obj.operand === "OR") &&
        Array.isArray(obj.children) &&
        obj.children.every(isAstElement) // Uses isAstElement for each child
    );
}

/**
 * Checks if the given object conforms to the AstElement type, which can be either AstTopLayer or AstBottomLayerValue.
 * @param obj - The object to check.
 * @returns True if the object matches either AstTopLayer or AstBottomLayerValue type, otherwise false.
 */
export function isAstElement(obj: any): obj is AstElement {
    return isAstTopLayer(obj) || isAstBottomLayerValue(obj);
}
