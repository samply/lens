import type { Site } from "./response";

export type Measure = {
    key: string;
    measure: object;
    cql: string;
};

export type ResponseStore = Map<string, Site>;

export type SpotOption = {
    url: string;
    sites: string[];
    uiSiteMap: string[][];
    catalogueKeyToResponseKeyMap: string[][];
};
/**
 * TODO: implement BlazeOption
 */
export type BlazeOption = null;
export type BackendOptions = {
    spots: SpotOption[];
    blazes: BlazeOption[];
};
