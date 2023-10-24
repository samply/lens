export type TreeNode = Category[] |Category | Criteria | AggregatedValue[] | AggregatedValue

export type Category = {
    key: string;
    name: string;
    childCategories?: Category[];
    infoButtonText?: string[];
    subCategoryName?: string;
} | {
    key: string;
    name: string;
    system?: string;
    fieldType: 'single-select' | 'autocomplete' | 'number';
    type: 'EQUALS' | 'BETWEEN';
    criteria: | Criteria[];
    description?: string;
    infoButtonText?: string[];
}

export type Criteria = {
    key: string;
    name: string;
    description?: string;
    aggregatedValue?: AggregatedValue[][]
}

export type AggregatedValue = {
    value: string;
    name: string;
    type: string;
    system?: string;
}
