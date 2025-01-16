export type LensOptions = {
    // TODO: remove the index signature and instead properly define all fields and their types
    [key: string]: unknown;
    chartOptions?: ChartOptions;
    catalogueKeyToResponseKeyMap?: string[][];
};

export type NegotiateOptionsSiteMapping = {
    site: string;
    site_id: string;
    collection_id: string;
    collection: string;
};

export type NegotiateOptions = {
    newProjectUrl: string;
    siteMappings: NegotiateOptionsSiteMapping[];
};

export type ChartOptions = {
    [key: string]: ChartOption;
};

export type ChartOption = {
    legendMapping?: { [key: string]: string };
    hintText?: string[];
    aggregations?: string[];
    tooltips?: { [key: string]: string };
    accumulatedValues: { name: string; values: string[] }[];
};
