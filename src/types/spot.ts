export type BeamResult = {
    body: string;
    from: string;
    metadata: string;
    status: "succeeded" | "claimed" | "tempfailed" | "permfailed";
    task: string;
    to: string[];
};

export type SpotOption = {
    name: string;
    backendMeasures: string;
    url: string;
    sites: string[];
    uiSiteMap: string[][];
};
