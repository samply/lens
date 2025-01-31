export type TreeNode =
    | Category[]
    | Category
    | Criteria
    | AggregatedValue[]
    | AggregatedValue;

export type Category = CategoryBranch | CategoryLeaf;

export type CategoryBranch = {
    nodeType: "branch";
    key: string;
    name: string;
    childCategories: Category[];
    infoButtonText?: string[];
    subCategoryName?: string;
    infoLink?: InfoLink;
};

export type InfoLink = {
    link: string;
    display: string;
};

export type CategoryLeaf = {
    nodeType: "leaf";
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
