// Note: The JSON schema file options.schema.json is automatically generated
// from the type definitions in this file. After making changes to this file run
// `npm run schemagen` to update the JSON schema.

export type LensOptions = {
    chartOptions?: ChartOptions;
    catalogueKeyToResponseKeyMap?: [string, string][];
    siteMappings?: { [key: string]: string };
    negotiateOptions?: NegotiateOptions;
    projectmanagerOptions?: ProjectManagerOptions;
    tableOptions?: TableOptions;
    resultSummaryOptions?: ResultSummaryOptions;
    /** Two letter language code of the application language */
    language?: string;
    /** Allows to customize texts and add new translations */
    texts?: Texts;
    /** If set, fetch and display facet counts (number of results per discrete value) in the catalogue. */
    facetCount?: FacetCountOptions;
    /** Whether to automatically update the query in the URL when it changes (default: true) */
    autoUpdateQueryInUrl?: boolean;
};

export type FacetCountOptions = {
    /** URL of the backend that provides facet counts */
    backendUrl: string;
    /** Hover text for each stratifier in the catalogue */
    hoverText: Record<string, string>;
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
    accumulatedValues?: { name: string; values: string[] }[];
};

export type TableOptions = {
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

/**
 * A map of texts that are displayed in the application. The keys are used to
 * look up the text in the application code. The values are objects that map
 * two letter language codes to the actual text.
 */
export type Texts = {
    [key: string]: {
        [key: string]: string;
    };
};
