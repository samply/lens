import { beforeAll, expect, test } from "vitest";
import {
    legacyUpdateResponseStore,
    getTotal,
    getSiteTotal,
    getStratum,
    getSiteStratum,
    getStrata,
} from "./response";

test("getTotals", () => {
    expect(getTotal("patients")).toBe(57630);
});

test("getSiteTotals", () => {
    expect(getSiteTotal("mannheim", "patients")).toBe(31020);
    expect(getSiteTotal("mainz", "patients")).toBe(26610);
});

test("getStratum", () => {
    expect(getStratum("gender", "male")).toEqual(36080);
    expect(getStratum("gender", "female")).toEqual(21550);
    expect(getStratum("gender", "unknown")).toEqual(10);
});

test("getSiteStratum", () => {
    expect(getSiteStratum("mannheim", "gender", "male")).toEqual(19130);
    expect(getSiteStratum("mannheim", "gender", "female")).toEqual(11900);
    expect(getSiteStratum("mannheim", "gender", "unknown")).toEqual(0);
    expect(getSiteStratum("mainz", "gender", "male")).toEqual(16950);
    expect(getSiteStratum("mainz", "gender", "female")).toEqual(9650);
    expect(getSiteStratum("mainz", "gender", "unknown")).toEqual(10);
});

test("getStrata", () => {
    expect(getStrata("gender").sort()).toEqual(
        ["female", "male", "unknown"].sort(),
    );
});

// Mock site responses
beforeAll(() => {
    legacyUpdateResponseStore(
        new Map([
            [
                "mannheim",
                {
                    status: "succeeded",
                    data: {
                        date: "2025-06-24T11:32:02.246285401Z",
                        extension: [
                            {
                                url: "https://samply.github.io/blaze/fhir/StructureDefinition/eval-duration",
                                valueQuantity: {
                                    code: "s",
                                    system: "http://unitsofmeasure.org",
                                    unit: "s",
                                    value: 19.065163958,
                                },
                                valueRatio: null,
                            },
                            {
                                url: "https://samply.github.io/blaze/fhir/StructureDefinition/bloom-filter-ratio",
                                valueQuantity: null,
                                valueRatio: {
                                    denominator: {
                                        value: 0,
                                    },
                                    numerator: {
                                        value: 0,
                                    },
                                },
                            },
                        ],
                        group: [
                            {
                                code: {
                                    text: "patients",
                                },
                                population: [
                                    {
                                        code: {
                                            coding: [
                                                {
                                                    code: "initial-population",
                                                    system: "http://terminology.hl7.org/CodeSystem/measure-population",
                                                },
                                            ],
                                        },
                                        count: 31020,
                                    },
                                ],
                                stratifier: [
                                    {
                                        code: [
                                            {
                                                text: "gender",
                                            },
                                        ],
                                        stratum: [
                                            {
                                                population: [
                                                    {
                                                        code: {
                                                            coding: [
                                                                {
                                                                    code: "initial-population",
                                                                    system: "http://terminology.hl7.org/CodeSystem/measure-population",
                                                                },
                                                            ],
                                                        },
                                                        count: 11900,
                                                    },
                                                ],
                                                value: {
                                                    text: "female",
                                                },
                                            },
                                            {
                                                population: [
                                                    {
                                                        code: {
                                                            coding: [
                                                                {
                                                                    code: "initial-population",
                                                                    system: "http://terminology.hl7.org/CodeSystem/measure-population",
                                                                },
                                                            ],
                                                        },
                                                        count: 19130,
                                                    },
                                                ],
                                                value: {
                                                    text: "male",
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                        id: null,
                        measure:
                            "urn:uuid:3a61ebcc-1397-4aed-805d-4440904dd382",
                        meta: null,
                        period: {
                            end: "2030",
                            start: "2000",
                        },
                        resourceType: "MeasureReport",
                        status: "complete",
                        type: "summary",
                    },
                },
            ],
            [
                "mainz",
                {
                    status: "succeeded",
                    data: {
                        date: "2025-06-24T11:32:02.254797579Z",
                        extension: [
                            {
                                url: "https://samply.github.io/blaze/fhir/StructureDefinition/eval-duration",
                                valueQuantity: {
                                    code: "s",
                                    system: "http://unitsofmeasure.org",
                                    unit: "s",
                                    value: 15.180903638,
                                },
                                valueRatio: null,
                            },
                            {
                                url: "https://samply.github.io/blaze/fhir/StructureDefinition/bloom-filter-ratio",
                                valueQuantity: null,
                                valueRatio: {
                                    denominator: {
                                        value: 0,
                                    },
                                    numerator: {
                                        value: 0,
                                    },
                                },
                            },
                        ],
                        group: [
                            {
                                code: {
                                    text: "patients",
                                },
                                population: [
                                    {
                                        code: {
                                            coding: [
                                                {
                                                    code: "initial-population",
                                                    system: "http://terminology.hl7.org/CodeSystem/measure-population",
                                                },
                                            ],
                                        },
                                        count: 26610,
                                    },
                                ],
                                stratifier: [
                                    {
                                        code: [
                                            {
                                                text: "gender",
                                            },
                                        ],
                                        stratum: [
                                            {
                                                population: [
                                                    {
                                                        code: {
                                                            coding: [
                                                                {
                                                                    code: "initial-population",
                                                                    system: "http://terminology.hl7.org/CodeSystem/measure-population",
                                                                },
                                                            ],
                                                        },
                                                        count: 16950,
                                                    },
                                                ],
                                                value: {
                                                    text: "male",
                                                },
                                            },
                                            {
                                                population: [
                                                    {
                                                        code: {
                                                            coding: [
                                                                {
                                                                    code: "initial-population",
                                                                    system: "http://terminology.hl7.org/CodeSystem/measure-population",
                                                                },
                                                            ],
                                                        },
                                                        count: 9650,
                                                    },
                                                ],
                                                value: {
                                                    text: "female",
                                                },
                                            },
                                            {
                                                population: [
                                                    {
                                                        code: {
                                                            coding: [
                                                                {
                                                                    code: "initial-population",
                                                                    system: "http://terminology.hl7.org/CodeSystem/measure-population",
                                                                },
                                                            ],
                                                        },
                                                        count: 10,
                                                    },
                                                ],
                                                value: {
                                                    text: "unknown",
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                        id: null,
                        measure:
                            "urn:uuid:3a61ebcc-1397-4aed-805d-4440904dd382",
                        meta: null,
                        period: {
                            end: "2030",
                            start: "2000",
                        },
                        resourceType: "MeasureReport",
                        status: "complete",
                        type: "summary",
                    },
                },
            ],
        ]),
    );
});
