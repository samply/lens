import type { Status } from "./response";

export type BeamResult = {
    body: string;
    from: string;
    metadata: string;
    status: Status;
    task: string;
    to: string[];
};

export type SpotOption = {
    name: string;
    backendMeasures: string;
    url: string;
    sites: string[];
    uiSiteMap: string[][];
    catalogueKeyToResponseKeyMap: string[][];
};
