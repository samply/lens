export type QueryItem = {
    key: string;
    name: string;
    values: QueryValue[];
    description?: string;
}

export type QueryValue = {
    key: string;
    name: string | number;
}
