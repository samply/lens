// This import loads lens CSS and web components as a side effect
import { setCatalogue, setOptions } from "./src/index";
import type { QueryEvent, Site } from "./src/index";

setOptions({
    siteMappings: {
        riverside: "Riverside",
        summit: "Summit",
    },
    catalogueKeyToResponseKeyMap: [["gender", "Gender"]],
    chartOptions: {
        gender: {
            legendMapping: {
                male: "Männlich",
                female: "Weiblich",
                other: "Divers",
            },
        },
    },
    tableOptions: {
        headerData: [
            {
                title: "Standorte",
                dataKey: "site",
            },
            {
                title: "Patienten",
                dataKey: "patients",
            },
        ],
    },
    resultSummaryOptions: {
        title: "Ergebnisse",
        dataTypes: [
            {
                title: "Standorte",
                dataKey: "collections",
            },
            {
                title: "Patienten",
                dataKey: "patients",
            },
        ],
    },
});

setCatalogue([
    {
        key: "gender",
        name: "Geschlecht",
        system: "",
        fieldType: "single-select",
        type: "EQUALS",
        criteria: [
            {
                key: "male",
                name: "Männlich",
            },
            {
                key: "female",
                name: "Weiblich",
            },
            {
                key: "other",
                name: "Divers",
            },
        ],
    },
    {
        key: "age",
        name: "Alter",
        fieldType: "number",
        type: "BETWEEN",
        system: "",
    },
]);

window.addEventListener("emit-lens-query", (event) => {
    const detail = (event as QueryEvent).detail;
    detail.updateResponse(new Map([["riverside", makeSite(5, 4, 0)]]));
    detail.updateResponse(new Map([["summit", makeSite(12, 18, 3)]]));
});

/**
 * Create a mock {@link Site} response
 */
function makeSite(male: number, female: number, other: number): Site {
    return {
        status: "succeeded",
        data: {
            date: "2025-03-13T09:39:22.238610329Z",
            extension: [
                {
                    url: "https://samply.github.io/blaze/fhir/StructureDefinition/eval-duration",
                    valueQuantity: {
                        code: "s",
                        system: "http://unitsofmeasure.org",
                        unit: "s",
                        value: 7.755854268,
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
                            count: male + female + other,
                        },
                    ],
                    stratifier: [
                        {
                            code: [
                                {
                                    text: "Gender",
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
                                            count: male,
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
                                            count: female,
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
                                            count: other,
                                        },
                                    ],
                                    value: {
                                        text: "other",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
            measure: "urn:uuid:19a1b508-eaa1-483a-b9a2-26f505509e6a",
            period: {
                end: "2030",
                start: "2000",
            },
            resourceType: "MeasureReport",
            status: "complete",
            type: "summary",
        },
    };
}
