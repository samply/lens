export interface GetHumanReadableQuery {
    useFullAggregatedValues?: boolean;
    getObject?: boolean;
}

export type HumanReadableQueryObject = {
    header: string;
    groups: HumanReadableGroup[];
};

export type HumanReadableGroup = {
    groupHeader: string;
    groupItems: HumanReadableItem[];
};

export type HumanReadableItem = {
    name: string;
    values: string | string[][];
};
