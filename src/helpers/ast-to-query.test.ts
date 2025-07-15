import { expect, test } from "vitest";
import { setQueryStoreFromAst } from "./ast-to-query";
import { getAst } from "./ast-transformer";
import type { AstTopLayer } from "../types/ast";

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
                                system: "",
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
                                system: "",
                                value: "A+",
                            },
                            {
                                key: "blood-group",
                                type: "EQUALS",
                                system: "",
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
                                system: "",
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
                                system: "",
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
                                system: "",
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
                                system: "",
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
                                system: "",
                                value: "blabliblub",
                            },
                        ],
                    },
                ],
            },
        ],
    });
});
