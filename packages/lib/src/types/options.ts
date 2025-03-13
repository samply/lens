export type LensOptions = {
    // TODO: remove the index signature and instead properly define all fields and their types
    [key: string]: unknown;
    chartOptions?: ChartOptions;
    catalogueKeyToResponseKeyMap?: [string, string][];
    negotiateOptions?: NegotiateOptions;
    projectmanagerOptions?: ProjectManagerOptions;
    tableOptions: TableOptions;
    resultSummaryOptions: ResultSummaryOptions;
};

export type NegotiateOptions = {
    /**
     * The URL of the BBMRI Negotiator API endpoint that creates a request to
     * apply for access. The URL path is typically /api/v3/requests. Lens will
     * send a POST request to the URL to start the application process.
     */
    url: string;
    /** The value of the Authorization header for the POST request. */
    authorizationHeader: string;
    /**
     * Maps the site names in the results table to the unique identifiers
     * expected by the BBMRI Negotiator.
     */
    siteMappings: NegotiateOptionsSiteMapping[];
};

export type NegotiateOptionsSiteMapping = {
    /**
     * Name of the site, e.g. "Aachen". This must correspond to the site names
     * as they are displayed in the results table.
     */
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

export type TableOptions = {
    /**
     * Text to display in the table when a query has been sent to a site and
     * lens is waiting for the result.
     */
    claimedText?: string;
    headerData: HeaderData[];
};

export type ResultSummaryOptions = {
    title?: string;
    infoButtonText?: string;
    dataTypes: HeaderData[];
};

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
