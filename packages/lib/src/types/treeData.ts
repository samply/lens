export type TreeNode = Category[] |Category | Criteria | AggregatedValue[] | AggregatedValue

export type Category = {
    key: string;
    name: string;
    childCategories?: Category[] 
} | {
    key: string;
    name: string;
    system?: string;
    fieldType: 'single-select' | 'autocomplete' | 'number';
    type: 'EQUALS' | 'BETWEEN';
    criteria: | Criteria[];
    
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
