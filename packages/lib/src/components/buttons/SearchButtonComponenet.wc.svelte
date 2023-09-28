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


    export let title: string = "Search";
    export let backendUrl: string = "";
    export let disabled: boolean = false;
    export let measures: Measure[] = [];

    const cqlMock = `library Retrieve
using FHIR version '4.0.0'
include FHIRHelpers version '4.0.0'

codesystem loinc: 'http://loinc.org'

context Patient

define Gender:
if (Patient.gender is null) then 'unknown' else Patient.gender

define AgeClass:
if (Patient.birthDate is null) then 'unknown' else ToString((AgeInYears() div 10) * 10)

define PatientDeceased:
First (from [Observation: Code '75186-7' from loinc] O return O.value.coding.where(system = 'http://dktk.dkfz.de/fhir/onco/core/CodeSystem/VitalstatusCS').code.first())
define Deceased:
if (PatientDeceased is null) then 'unbekannt' else PatientDeceased

define Diagnosis:
if InInitialPopulation then [Condition] else {} as List<Condition>

define function DiagnosisCode(condition FHIR.Condition):
condition.code.coding.where(system = 'http://fhir.de/CodeSystem/bfarm/icd-10-gm').code.first()

define Specimen:
if InInitialPopulation then [Specimen] else {} as List<Specimen>

define function SampleType(specimen FHIR.Specimen):
specimen.type.coding.where(system = 'https://fhir.bbmri.de/CodeSystem/SampleMaterialType').code.first()

define Procedure:
if InInitialPopulation then [Procedure] else {} as List <Procedure>

define function ProcedureType(procedure FHIR.Procedure):
procedure.category.coding.where(system = 'http://dktk.dkfz.de/fhir/onco/core/CodeSystem/SYSTTherapieartCS').code.first()

define MedicationStatement:
if InInitialPopulation then [MedicationStatement] else {} as List <MedicationStatement>
define InInitialPopulation:
true`;


    const getResultsFromBiobanks = async () => {
        const ast = buildAstFromQuery($queryStore);
        const cql = translateAstToCql(ast);

        console.log(cql);
        console.log(cqlMock);

        const blaze = new Blaze(
            new URL('http://localhost:8080/fhir')
        )

        const response = await blaze.send(cqlMock);

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
