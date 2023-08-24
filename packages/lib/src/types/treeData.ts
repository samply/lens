export type Criteria = {
    key: string;
    name: string;
    description?: string;
}

export type Category = {
    key: string;
    name: string;
    type?: 'checkbox' | 'autocomplete' | 'number';
    childCategories?: Category[] 
    criteria?: | Criteria[];
}