// Note: The JSON schema file catalogue.schema.json is automatically generated
// from the type definitions in this file. After making changes to this file run
// `npm run schema:generate` to update the JSON schema.

type BaseElement = {
    /** A key that uniquely identifies the catalogue element. */
    key: string;
    /** The element's user-facing display name. */
    name: string;
    /** Optional text accessed by clicking a "ⓘ" button next to the display name. */
    infoButtonText?: string[];
    /** Optional hyperlink shown next to the display name. */
    infoLink?: {
        link: string;
        display: string;
    };
};

/** @discriminator type */
export type CatalogueElement =
    | CatalogueGroup
    | SelectElement
    | AutocompleteElement
    | NumericRangeElement
    | DateRangeElement
    | FreeTextElement;

/** The top-level catalogue type passed to Lens. */
export type LensCatalogue = CatalogueElement[];

/**
 * A logical grouping of catalogue elements rendered as a collapsible
 * entry in the catalogue tree.
 */
export type CatalogueGroup = {
    type: "CatalogueGroup";
    /** The group's user-facing display name. */
    name: string;
    /** The list of catalogue elements in the group. */
    elements: CatalogueElement[];
    /** Optional text accessed by clicking a "ⓘ" button. */
    infoButtonText?: string[];
    /** Optional hyperlink shown next to the display name. */
    infoLink?: {
        link: string;
        display: string;
    };
};

/**
 * A catalogue element that lets the user select one or more options
 * from a predefined list rendered in the catalogue tree.
 */
export type SelectElement = BaseElement & {
    type: "SelectElement";
    options: CatalogueOption[];
};

/**
 * A catalogue element that lets the user find and select options
 * via an autocomplete text box.
 */
export type AutocompleteElement = BaseElement & {
    type: "AutocompleteElement";
    options: CatalogueOption[];
};

/**
 * A catalogue element that lets the user specify a numeric range.
 */
export type NumericRangeElement = BaseElement & {
    type: "NumericRangeElement";
    /** The smallest value the user can enter. */
    min?: number;
    /** The largest value the user can enter. */
    max?: number;
    /** Optional unit text shown next to the input field, e.g. "kg". */
    unitText?: string;
};

/**
 * A catalogue element that lets the user specify a date range.
 */
export type DateRangeElement = BaseElement & {
    type: "DateRangeElement";
    /**
     * The earliest date the user can pick.
     * @format date
     */
    min?: string;
    /**
     * The latest date the user can pick.
     * @format date
     */
    max?: string;
};

/**
 * A catalogue element that lets the user specify a free-text string.
 */
export type FreeTextElement = BaseElement & {
    type: "FreeTextElement";
};

export type CatalogueOption = {
    /** The catalogue option's value identifier. */
    value: string;
    /** The catalogue option's user-facing display name. */
    name: string;
    /** Optional description shown during autocompletion. */
    description?: string;
    /**
     * Optional aggregate expansion represented as a nested list:
     * outer array = AND, inner array = OR.
     */
    aggregatedValue?: AggregatedValue[][];
    /** Nested sub-options. */
    suboptions?: CatalogueOption[];
    /** Whether this option can be selected by the user. Defaults to true. */
    selectable?: boolean;
};

export type AggregatedValue = {
    /** Catalogue element key referenced by this aggregated value entry. */
    key: string;
    /** Catalogue option value referenced by this aggregated value entry. */
    value: string;
};
