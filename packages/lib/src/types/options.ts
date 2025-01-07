export type LensOptions = {
    [key: string]: unknown;
    chartOptions?: ChartOptions;
    catalogueKeyToResponseKeyMap?: string[][];
    negotiatorOptions?: NegotiatorOptions;
    projectmanagerOptions?: ProjectManagerOptions;
};

export type NegotiateOptionsSiteMapping = {
    site: string;
    site_id: string;
    collection_id: string;
    collection: string;
};

export type ProjectManagerOptionsSiteMapping = {
    site: string;
    collection: string;
};

export type NegotiatorOptions = {
    url: string;
    siteMappings: NegotiateOptionsSiteMapping[];
};

export type ProjectManagerOptions = {
    newProjectUrl: string;
    editProjectUrl: string;
    siteMappings: ProjectManagerOptionsSiteMapping[];
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
