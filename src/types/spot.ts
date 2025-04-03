export type BeamResult = {
    body: string;
    from: string;
    metadata: string;
    status: "succeeded" | "claimed" | "tempfailed" | "permfailed";
    task: string;
    to: string[];
};
