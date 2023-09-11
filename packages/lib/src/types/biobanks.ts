
export type HeaderData = {
    title: string;
    dataKey: string;
};
export type Biobank = Map<string, string | number | boolean | null | undefined>;
export type TransformedBiobank  = [string, string | number | boolean | null | undefined][];