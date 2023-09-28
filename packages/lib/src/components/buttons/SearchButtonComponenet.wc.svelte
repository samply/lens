<svelte:options customElement={{
    tag: "lens-search-button",
    props: {
        measures: { type: "Object" },
        disabled: { type: "Boolean" },
    }
}} />

<script lang="ts">
    // import { translateAstToCql } from "../../cql-translator-service/ast-to-cql-translator";
    import { buildAstFromQuery } from "../../helpers/ast-transformer";
    import { Blaze } from "../../classes/blaze";
    import { queryStore } from "../../stores/query";
    import { measureStore } from "../../stores/measures";
    import { responseStore } from "../../stores/response";
    import {translateAstToCql} from "../../cql-translator-service/ast-to-cql-translator";
    import type { Measure } from "../../types/Measure";
    import { Spot } from "../../classes/spot";
    import { buildLibrary, buildMeasure } from "../../helpers/cql-measure";


    export let title: string = "Search";
    export let backendUrl: string = "";
    export let disabled: boolean = false;
    export let measures: Measure[] = [];

    const cqlMock = `library Retrieve
using FHIR version '4.0.0'
include FHIRHelpers version '4.0.0'

codesystem loinc: 'http://loinc.org'

context Patient

DKTK_STRAT_GENDER_STRATIFIER

DKTK_STRAT_AGE_STRATIFIER

DKTK_STRAT_DECEASED_STRATIFIER

DKTK_STRAT_DIAGNOSIS_STRATIFIER

DKTK_STRAT_SPECIMEN_STRATIFIER

DKTK_STRAT_PROCEDURE_STRATIFIER

DKTK_STRAT_MEDICATION_STRATIFIER

DKTK_STRAT_ENCOUNTER_STRATIFIER

DKTK_STRAT_DEF_IN_INITIAL_POPULATION
true`;

    const measureDefinitionsMock = [
    {
        "code": {
            "text": "patients"
        },
        "population": [
            {
                "code": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/measure-population",
                            "code": "initial-population"
                        }
                    ]
                },
                "criteria": {
                    "language": "text/cql-identifier",
                    "expression": "InInitialPopulation"
                }
            }
        ],
        "stratifier": [
            {
                "code": {
                    "text": "Gender"
                },
                "criteria": {
                    "language": "text/cql",
                    "expression": "Gender"
                }
            },
            {
                "code": {
                    "text": "75186-7"
                },
                "criteria": {
                    "language": "text/cql",
                    "expression": "Deceased"
                }
            },
            {
                "code": {
                    "text": "Age"
                },
                "criteria": {
                    "language": "text/cql",
                    "expression": "AgeClass"
                }
            }
        ]
    }
]


    const getResultsFromBiobanks = async () => {
        const ast = buildAstFromQuery($queryStore);
        const cql = translateAstToCql(ast);

        console.log(cql);
        console.log(cqlMock);

        // const blaze = new Blaze(
        //     new URL('http://localhost:8080/fhir')
        // )
        // const response = await blaze.send(cqlMock);

        const library = buildLibrary(cqlMock)
        const measure = buildMeasure(library.url, measureDefinitionsMock)
        const query = {lang: "cql", lib: library, measure: measure};

        const spot = new Spot(
            new URL('http://localhost:8080'),
            ['dktk-test', 'mannheim']
        )

        const response = await spot.send(
            btoa(unescape(JSON.stringify(query)))
        )

        console.log(response)
    };
</script>

<button
    part={`lens-search-button lens-search-button-${
        disabled ? "disabled" : "active"
    }`}
    on:click={getResultsFromBiobanks}
    {disabled}
>
    <div part="lens-search-button-magnifying-glass">&#x26B2;</div>
    <div part="lens-search-button-title">
        {title}
    </div>
</button>
