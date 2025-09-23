import type {
    AggregatedValue,
    DateRangeCategory,
    NumericRangeCategory,
    StringCategory,
} from "./catalogue";

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

export type AutoCompleteCriterionItem = {
    fieldType: string;
    name: string;
    key: string;
    system?: string;
    type: string;
    criterion: {
        key: string;
        name: string;
        description?: string;
        aggregatedValue?: AggregatedValue[][];
    };
};

export type AutoCompleteItem =
    | AutoCompleteCriterionItem
    | NumericRangeCategory
    | DateRangeCategory
    | StringCategory;
