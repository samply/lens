export type Measure = {
    key: string;
    measure: object;
    cql: string;
};

export type BackendConfig = {
    url: string;
    backends: string[];
    uiSiteMap: string[][];
};