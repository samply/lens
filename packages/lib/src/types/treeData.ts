export type TreeNode =
    | Category[]
    | Category
    | Criteria
    | AggregatedValue[]
    | AggregatedValue;

export type Category = CategoryGroup | CategoryField;

export type CategoryGroup = {
    key: string;
    name: string;
    childCategories: Category[];
    infoButtonText?: string[];
    subCategoryName?: string;
};

export type CategoryField = {
    key: string;
    name: string;
    system?: string;
    fieldType: "single-select" | "autocomplete" | "number" | "date";
    type: "EQUALS" | "BETWEEN";
    min?: number | string;
    max?: number | string;
    criteria: Criteria[];
    description?: string;
    infoButtonText?: string[];
};

export type Criteria = {
    key: string;
    name: string;
    description?: string;
    aggregatedValue?: AggregatedValue[][];
};

export type AggregatedValue = {
    value: string;
    name: string;
    type: string;
    system?: string;
};
