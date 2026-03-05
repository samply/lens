/**
 * The query represents the user's current search expressed as a
 * disjunction (OR) of bars, where each bar is a conjunction (AND)
 * of items.
 */
export type Query = {
    bars: QueryBar[];
};

export type QueryBar = {
    items: QueryItem[];
};

/** @discriminator type */
export type QueryItem = SetItem | NumericRangeItem | DateRangeItem;

type BaseItem = {
    /**
     * Element key — references an entry in the flattened element map.
     */
    key: string;
    /**
     * If true this item is negated ("red" chip) and will be wrapped
     * in a NotOperator in the generated AST.
     */
    negated: boolean;
};

export type SetItem = BaseItem & {
    type: "SetItem";
    /**
     * Selected option values. Each string is the `value` part of a
     * key in the flattened option map (`${elementKey}.${value}`).
     */
    values: string[];
};

export type NumericRangeItem = BaseItem & {
    type: "NumericRangeItem";
    /** Inclusive lower bound. */
    min?: number;
    /** Inclusive upper bound. */
    max?: number;
};

export type DateRangeItem = BaseItem & {
    type: "DateRangeItem";
    /**
     * Inclusive lower bound in YYYY-MM-DD format.
     * @format date
     */
    min?: string;
    /**
     * Inclusive upper bound in YYYY-MM-DD format.
     * @format date
     */
    max?: string;
};
