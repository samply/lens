// Note: The JSON schema file catalogue.schema.json is automatically generated
// from the type definitions in this file. After making changes to this file run
// `npm run schema:generate` to update the JSON schema.

import type { AstNode } from "./ast";

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
    /**
     * Optional list of domain display names this element belongs to.
     * If omitted the element is available in all domains.
     */
    domains?: string[];
    /**
     * When true, a danger-coloured minus button is shown next to the element,
     * allowing the user to add a negated (NOT) filter.
     */
    negatable?: boolean;
};

/** @discriminator type */
export type CatalogueElement =
    | CatalogueGroup
    | SelectElement
    | AutocompleteElement
    | NumericRangeElement
    | DateRangeElement
    | FreeTextElement;

/** All leaf catalogue element types (excludes CatalogueGroup). */
export type LeafCatalogueElement = Exclude<CatalogueElement, CatalogueGroup>;

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
     * Optional AST override. When set, selecting this option inserts
     * this AST subtree instead of a simple SetFilter with the value.
     */
    ast?: AstNode;
    /** Nested sub-options. */
    suboptions?: CatalogueOption[];
    /** Whether this option is visible in the catalogue tree. Defaults to true. */
    visible?: boolean;
};
