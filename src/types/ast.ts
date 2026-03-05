/** @discriminator type */
export type AstNode =
    | AndOperator
    | OrOperator
    | NotOperator
    | SetFilter
    | NumericRangeFilter
    | DateRangeFilter;

export type AndOperator = {
    type: "AndOperator";
    operands: AstNode[];
};

export type OrOperator = {
    type: "OrOperator";
    operands: AstNode[];
};

export type NotOperator = {
    type: "NotOperator";
    operand: AstNode;
};

/**
 * Filter that checks set membership. Equality is a special case
 * with a single entry in the `values` array.
 */
export type SetFilter = {
    type: "SetFilter";
    key: string;
    values: string[];
};

export type NumericRangeFilter = {
    type: "NumericRangeFilter";
    key: string;
    /** Ranges are inclusive. At least one bound must be specified. */
    min?: number;
    max?: number;
};

export type DateRangeFilter = {
    type: "DateRangeFilter";
    key: string;
    /**
     * Ranges are inclusive. At least one bound must be specified.
     * Bounds are in the format YYYY-MM-DD.
     * @format date
     */
    min?: string;
    max?: string;
};
