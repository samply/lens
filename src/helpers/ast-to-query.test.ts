import { expect, test } from "vitest";
import { setQueryStoreFromAst } from "./ast-to-query";
import { getAst } from "./ast-transformer";
import type { AstTopLayer } from "../types/ast";
import { setQueryStore } from "../stores/query";

function testConversion(ast: AstTopLayer): void {
    setQueryStoreFromAst(ast);
    expect(getAst()).toEqual(ast);
}

test("setQueryStoreFromAst: empty query", () => {
    testConversion({ operand: "OR", children: [] });
});

test("setQueryStoreFromAst: single select", () => {
    // one value
    testConversion({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "blood-group",
                        operand: "OR",
                        children: [
                            {
                                key: "blood-group",
                                type: "EQUALS",
                                value: "A+",
                            },
                        ],
                    },
                ],
            },
        ],
    });
    // multiple values
    testConversion({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "blood-group",
                        operand: "OR",
                        children: [
                            {
                                key: "blood-group",
                                type: "EQUALS",
                                value: "A+",
                            },
                            {
                                key: "blood-group",
                                type: "EQUALS",
                                value: "B+",
                            },
                        ],
                    },
                ],
            },
        ],
    });
});

test("setQueryStoreFromAst: numeric range", () => {
    // range with minimum and maximum
    testConversion({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "body_weight",
                        operand: "OR",
                        children: [
                            {
                                key: "body_weight",
                                type: "BETWEEN",
                                value: { min: 30, max: 50 },
                            },
                        ],
                    },
                ],
            },
        ],
    });
    // range with minimum only
    testConversion({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "body_weight",
                        operand: "OR",
                        children: [
                            {
                                key: "body_weight",
                                type: "BETWEEN",
                                value: { min: 30 },
                            },
                        ],
                    },
                ],
            },
        ],
    });
});

test("setQueryStoreFromAst: date range", () => {
    // range with minimum and maximum
    testConversion({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "date-of-birth",
                        operand: "OR",
                        children: [
                            {
                                key: "date-of-birth",
                                type: "BETWEEN",
                                value: { min: "2014-01-01", max: "2024-01-01" },
                            },
                        ],
                    },
                ],
            },
        ],
    });
    // range with minimum only
    testConversion({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "date-of-birth",
                        operand: "OR",
                        children: [
                            {
                                key: "date-of-birth",
                                type: "BETWEEN",
                                value: { min: "2014-01-01" },
                            },
                        ],
                    },
                ],
            },
        ],
    });
});

test("setQueryStoreFromAst: string value", () => {
    testConversion({
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "sample-id",
                        operand: "OR",
                        children: [
                            {
                                key: "sample-id",
                                type: "EQUALS",
                                value: "blabliblub",
                            },
                        ],
                    },
                ],
            },
        ],
    });
});

test("getAst: empty queryStore returns top-level OR with no children", () => {
    setQueryStore([]);
    expect(getAst()).toEqual({ operand: "OR", children: [] });
});

test("getAst: 2-group OR query produces two AND children at top level", () => {
    const ast: AstTopLayer = {
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "gender",
                        operand: "OR",
                        children: [{ key: "gender", type: "EQUALS", value: "male" }],
                    },
                ],
            },
            {
                operand: "AND",
                children: [
                    {
                        key: "gender",
                        operand: "OR",
                        children: [{ key: "gender", type: "EQUALS", value: "female" }],
                    },
                ],
            },
        ],
    };
    testConversion(ast);
    expect(getAst().children).toHaveLength(2);
});

test("getAst: AND within a group produces multiple children under a single AND node", () => {
    const ast: AstTopLayer = {
        operand: "OR",
        children: [
            {
                operand: "AND",
                children: [
                    {
                        key: "gender",
                        operand: "OR",
                        children: [{ key: "gender", type: "EQUALS", value: "male" }],
                    },
                    {
                        key: "sample-id",
                        operand: "OR",
                        children: [{ key: "sample-id", type: "EQUALS", value: "S1" }],
                    },
                ],
            },
        ],
    };
    testConversion(ast);
    const top = getAst();
    expect(top.children).toHaveLength(1);
    const andNode = top.children[0];
    expect("children" in andNode && andNode.children).toHaveLength(2);
});
