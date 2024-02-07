import type { Site } from "./response";

export type Measure = {
    key: string;
    measure: object;
    cql: string;
};

export type BackendConfig = {
    url: string;
    backends: string[];
    uiSiteMap: string[][];
    catalogueKeyToResponseKeyMap: string[][];
};

export type ResponseStore = Map<string, Site>;
