export type TreeNode = Category[] |Category | Criteria | AggregatedValue[] | AggregatedValue

export type Category = {
    key: string;
    name: string;
    childCategories?: Category[];
    // TODO: Discuss naming with Mats, as this has another meaning than descrtiption in criteria
    description?: string;
} | {
    key: string;
    name: string;
    system?: string;
    fieldType: 'single-select' | 'autocomplete' | 'number';
    type: 'EQUALS' | 'BETWEEN';
    criteria: | Criteria[];
    description?: string;
    
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
