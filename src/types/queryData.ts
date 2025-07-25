import type { AggregatedValue } from "./catalogue";

export type QueryItem = {
    id: string;
    key: string;
    name: string;
    type: string;
    system?: string;
    values: QueryValue[];
    description?: string;
};

export type QueryValue = {
    name: string;
    value:
        | string
        | { min?: number; max?: number } // For numeric ranges
        | { min?: string; max?: string } // For date ranges
        | AggregatedValue[][];
    queryBindId: string;
    description?: string;
};

export type AutoCompleteItem = {
    name: string;
    key: string;
    description?: string;
    system?: string;
    type: string;
    criterion: {
        key: string;
        name: string;
        description?: string;
        aggregatedValue?: AggregatedValue[][];
    };
};

export type queryStoreItem =
    | QueryItem[]
    | QueryItem
    | QueryValue[]
    | QueryValue
    | AggregatedValue[]
    | AggregatedValue;

export type SendableQuery = {
    query: QueryItem[][];
    id: string;
};
