export type FhirMeasureItem = {
    key: string;
    measure: FhirMeasure;
    cql: string;
};

export type FhirMeasure = {
    code: {
        text: string;
    };
    extension?: {
        url: string;
        valueCode: string;
    }[];
    population: {
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
    }[];
    stratifier: {
        code: {
            text: string;
        };
        criteria: {
            language: string;
            expression: string;
        };
    }[];
};
