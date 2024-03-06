export type Stratum = {
    code: string;
    population?: number;
};

export type BeamResult = {
    body: string;
    from: string;
    metadata: string;
    status: Status;
    task: string;
    to: string[];
};

export type Status = "claimed" | "succeeded" | "tempfailed" | "permfailed";

export type Site = {
    status: Status;
    data: SiteData;
};

export type SiteData = {
    date: string;
    extension: object[];
    group: {
        code: {
            text: string;
        };
        population: {
            count: number;
            code: {
                coding: {
                    system: string;
                    code: string;
                }[];
            };
        }[];
        stratifier: {
            code: {
                text: string;
            }[];
            stratum?: {
                population?: {
                    count: number;
                    code: {
                        coding: {
                            code: string;
                            system: string;
                        }[];
                    };
                }[];
                value: {
                    text: string;
                };
            }[];
        }[];
    }[];
    measure: string;
    period: object;
    resourceType: string;
    status: string;
    type: string;
};
