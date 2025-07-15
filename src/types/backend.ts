export type MeasureItem = {
    key: string;
    measure: Measure;
    cql: string;
};

export type Measure = {
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

export type MeasureOption = {
    name: string;
    measures: MeasureItem[];
};

export type MeasureStore = MeasureOption[];
