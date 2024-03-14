import type { AstTopLayer } from "./ast";
import type { Site } from "./response";

export type MeasureItem = {
    key: string;
    measure: Measure;
    cql: string;
};
export type Measure = {
    code: {
        text: string;
    };
    extension: [
        {
            url: string;
            valueCode: string;
        },
    ];
    population: [
        {
            code: {
                coding: [
                    {
                        system: string;
                        code: string;
                    },
                ];
            };
            criteria: {
                language: string;
                expression: string;
            };
        },
    ];
    stratifier: [
        {
            code: {
                text: string;
            };
            criteria: {
                language: string;
                expression: string;
            };
        },
    ];
};

export type MeasureOption = {
    name: string;
    measures: MeasureItem[];
};

export type MeasureStore = MeasureOption[];

export type ResponseStore = Map<string, Site>;

export type SpotOption = {
    name: string;
    backendMeasures: string;
    url: string;
    sites: string[];
    uiSiteMap: string[][];
    catalogueKeyToResponseKeyMap: string[][];
};
/**
 * TODO: implement BlazeOption
 */
export type BlazeOption = {
    name: string;
    url: string;
    auth?: string;
    backendMeasures: string;
    uiSiteMap: string[][];
    catalogueKeyToResponseKeyMap: string[][];
};

export type BackendOptions = {
    spots: SpotOption[];
    blazes: BlazeOption[];
};

export interface QueryEvent extends Event {
    detail: {
        ast: AstTopLayer;
        updateResponse: (response: Map<string, Site>) => void;
        abortController?: AbortController;
    };
}
