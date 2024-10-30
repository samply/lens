export type LensOptions = {
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
    negotiateApp: string;
    newProjectUrl: string;
    editProjectUrl: string;
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
};
