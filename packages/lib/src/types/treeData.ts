export type Criteria = {
    key: string;
    name: string;
    description?: string;
}

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