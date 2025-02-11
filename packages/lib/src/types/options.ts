export type LensOptions = {
    // TODO: remove the index signature and instead properly define all fields and their types
    [key: string]: unknown;
    chartOptions?: ChartOptions;
    catalogueKeyToResponseKeyMap?: string[][];
    negotiateOptions?: NegotiateOptions;
    projectmanagerOptions?: ProjectManagerOptions;
};

export type NegotiateOptions = {
    url: string;
    siteMappings: NegotiateOptionsSiteMapping[];
};

export type NegotiateOptionsSiteMapping = {
    /** Name of the site, e.g. "Aachen" */
    site: string;
    /** Unique identifier of the collection, e.g. "bbmri-eric:ID:DE_RWTHCBMB:collection:RWTHCBMB_BC" */
    collection: string;
    /** Unique identifier of the site, e.g. "bbmri-eric:ID:DE_RWTHCBMB" */
    site_id: string;
    /** Name of the collection, e.g. "Collection of RWTH cBMB Broad Consent Aachen" */
    collection_name: string;
};

export type ProjectManagerOptionsSiteMapping = {
    site: string;
    collection: string;
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
    accumulatedValues: { name: string; values: string[] }[];
};
