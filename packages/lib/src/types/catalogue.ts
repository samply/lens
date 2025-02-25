/**
 * The catalogue is a tree-like data structure that describes what the user can
 * search for. The application passes the catalogue to lens as a JSON string via
 * the <lens-options> component. Lens validates the JSON against a JSON schema
 * that is automatically generated from this type definition. Many components of
 * lens use the catalogue. Most notably the <lens-catalogue> component renders
 * the catalogue as a collapsable tree and allows the user to add items from the
 * catalogue to the search bar.
 */
export type Catalogue = Category[];

// The @discriminator annotation tells ts-json-schema-generator to represent
// this type as a discriminated union in the generated JSON schema.
/** @discriminator fieldType */
export type Category =
    | CategoryGroup
    | SingleSelectCategory
    | AutocompleteCategory
    | NumericRangeCategory
    | DateRangeCategory;

/**
 * A logical grouping of catalogue items that is rendered as a collapsable entry
 * in the catalogue tree.
 */
export type CategoryGroup = {
    fieldType: "group";
    key: string;
    /** The group's user-facing display name */
    name: string;
    /** The list of catalogue items in the group */
    childCategories: Category[];
    /** Optional text that is accessed by clicking a "ⓘ" button next to the display name */
    infoButtonText?: string[];
    /** Optional hyperlink shown next to the display name */
    infoLink?: {
        /** The link URL */
        link: string;
        /** The link text */
        display: string;
    };
};

/**
 * A catalogue item that lets the user select one or more criteria from a
 * predefined list. The list of criteria is rendered in the catalogue tree and
 * the user can select criteria by clicking a "->" button. The resulting query
 * matches any of the selected criteria.
 */
export type SingleSelectCategory = {
    fieldType: "single-select";
    /** A key that uniquely identifies the catalogue item. It is typically used to look up the CQL snippet for that item. */
    key: string;
    /** The item's user-facing display name */
    name: string;
    system: string;
    type: "EQUALS";
    /** The list of criteria the user can select from */
    criteria: Criteria[];
    /** Optional text that is accessed by clicking a "ⓘ" button next to the display name */
    infoButtonText?: string[];
    subCategoryName?: string;
};

/**
 * A catalogue item that lets the user select one or more criteria from a
 * predefined list. The list of criteria is not rendered. Instead the user can
 * find and select items by typing into an autocomplete text box. The resulting
 * query matches any of the selected criteria.
 */
export type AutocompleteCategory = {
    fieldType: "autocomplete";
    /** A key that uniquely identifies the catalogue item. It is typically used to look up the CQL snippet for that item. */
    key: string;
    /** The item's user-facing display name */
    name: string;
    system: string;
    type: "EQUALS";
    /** The list of criteria the user can select from */
    criteria: Criteria[];
    /** Optional text that is accessed by clicking a "ⓘ" button next to the display name */
    infoButtonText?: string[];
};

/**
 * A catalogue item that lets the user specify a numeric range by entering a
 * minimum and a maximum value. The user can omit one of the values to express
 * less than or greater than constraints.
 */
export type NumericRangeCategory = {
    fieldType: "number";
    /** A key that uniquely identifies the catalogue item. It is typically used to look up the CQL snippet for that item. */
    key: string;
    /** The item's user-facing display name */
    name: string;
    system: string;
    type: "BETWEEN";
    /** The smallest value that the user can enter */
    min?: number;
    /** The largest value that the user can enter */
    max?: number;
    /** Optional text that is accessed by clicking a "ⓘ" button next to the display name */
    infoButtonText?: string[];
};

/**
 * A catalogue item that lets the user specify a date range by picking an
 * earliest and a latest date. The user can omit one of the dates to express
 * earlier than or later than constraints.
 */
export type DateRangeCategory = {
    fieldType: "date";
    /** A key that uniquely identifies the catalogue item. It is typically used to look up the CQL snippet for that item. */
    key: string;
    /** The item's user-facing display name */
    name: string;
    system: string;
    type: "BETWEEN";
    /**
     * The earliest date that the user can pick
     * @format date
     */
    min?: string;
    /**
     * The latest date that the user can pick
     * @format date
     */
    max?: string;
    infoButtonText?: string[];
};

/**
 * A criterion that can be selected in a single-select or autocomplete catalogue item.
 */
export type Criteria = {
    visible?: boolean;
    /** A key that uniquely identifies the criterion */
    key: string;
    /** The criterion's user-facing display name */
    name: string;
    /** Optional description that is shown next to the display name during autocompletion */
    description?: string;
    aggregatedValue?: AggregatedValue[][];
    subgroup?: Criteria[];
};

export type AggregatedValue = {
    value: string;
    name: string;
};
