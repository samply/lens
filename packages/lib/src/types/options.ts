export type LensOptions = {
    [key: string]: unknown;
    chartOptions?: ChartOptions;
    catalogueKeyToResponseKeyMap?: string[][];
};

export type ChartOptions = {
    [key: string]: ChartOption;
};

export type ChartOption = {
    legendMapping?: { [key: string]: string };
    hintText?: string[];
    aggregations?: string[];
    tooltips?: { [key: string]: string };
};
