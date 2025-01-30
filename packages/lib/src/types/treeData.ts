export type TreeNode =
    | Category[]
    | Category
    | Criteria
    | AggregatedValue[]
    | AggregatedValue;

export type CategoryNode = {
    key: string;
    name: string;
    childCategories?: Category[];
    infoButtonText?: string[];
    subCategoryName?: string;
    extra?: CategoryExtra;
};

export type CategoryExtra = {
    link?: string;
    display?: string;
};

export type CatagoryLeaf = {
    key: string;
    name: string;
    system?: string;
    fieldType: "single-select" | "autocomplete" | "number" | "date";
    type: "EQUALS" | "BETWEEN";
    min?: number;
    max?: number;
    criteria: Criteria[];
    description?: string;
    infoButtonText?: string[];
};

export const isCategoryNode = (obj: Category): obj is CategoryNode => {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.key === "string" &&
        typeof obj.name === "string" &&
        (obj.childCategories === undefined ||
            Array.isArray(obj.childCategories)) &&
        (obj.infoButtonText === undefined ||
            Array.isArray(obj.infoButtonText)) &&
        (obj.subCategoryName === undefined ||
            typeof obj.subCategoryName === "string")
    );
};

export const isCatagoryLeaf = (obj: Category): obj is CatagoryLeaf => {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.key === "string" &&
        typeof obj.name === "string" &&
        (obj.system === undefined || typeof obj.system === "string") &&
        (obj.fieldType === "single-select" ||
            obj.fieldType === "autocomplete" ||
            obj.fieldType === "number" ||
            obj.fieldType === "date") &&
        (obj.type === "EQUALS" || obj.type === "BETWEEN") &&
        (obj.min === undefined || typeof obj.min === "number") &&
        (obj.max === undefined || typeof obj.max === "number") &&
        Array.isArray(obj.criteria) &&
        (obj.description === undefined ||
            typeof obj.description === "string") &&
        (obj.infoButtonText === undefined || Array.isArray(obj.infoButtonText))
    );
};

export type Category = CatagoryLeaf | CategoryNode;

export type Criteria = {
    visible?: boolean;
    key: string;
    name: string;
    description?: string;
    aggregatedValue?: AggregatedValue[][];
    subgroup?: Criteria[];
};

export type AggregatedValue = {
    value: string;
    name: string;
    type: string;
    system?: string;
};
