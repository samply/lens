export type HeaderData = {
    title: string;
    dataKey?: string;
    aggregatedDataKeys?: {
        groupCode?: string;
        stratifierCode?: string;
        stratumCode?: string;
    }[];
    hintText?: string[];
};
