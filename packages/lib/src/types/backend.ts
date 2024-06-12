import type { AstTopLayer } from "./ast";
import type { BlazeOption } from "./blaze";
import type { Site } from "./response";
import type { SpotOption } from "./spot";

export type MeasureGroup = {
    name: string;
    measures: MeasureItem[];
};

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

export type BackendOptions = {
    spots?: SpotOption[];
    blazes?: BlazeOption[];
    customAstBackends?: string[];
};

export interface QueryEvent extends Event {
    detail: {
        ast: AstTopLayer;
        updateResponse: (response: Map<string, Site>) => void;
        abortController: AbortController;
    };
}
