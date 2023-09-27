<svelte:options customElement="lens-search-button" />

<script lang="ts">
    import { translateAstToCql } from "../../cql-translator-service/ast-to-cql-translator";
    import { buildAstFromQuery } from "../../helpers/ast-transformer";
    import { queryStore } from "../../stores/query";
    import { responseStore } from "../../stores/response";

    export let title: string = "Search";
    export let backendUrl: string = "";
    export let disabled: boolean = false;

    const getResultsFromBiobanks = async () => {
        // const ast = buildAstFromQuery($queryStore);
        // const cql = translateAstToCql(ast);

        const cql = `library Retrieve
using FHIR version '4.0.0'
include FHIRHelpers version '4.0.0'

codesystem loinc: 'http://loinc.org'
codesystem icd10: 'http://hl7.org/fhir/sid/icd-10'
codesystem SampleMaterialType: 'https://fhir.bbmri.de/CodeSystem/SampleMaterialType'

context Patient

define AgeClass:
if (Patient.birthDate is null) then 'unknown' else ToString((AgeInYears() div 10) * 10)

define Gender:
if (Patient.gender is null) then 'unknown' else Patient.gender

define Custodian:
    First(from Specimen.extension E
    where E.url = 'https://fhir.bbmri.de/StructureDefinition/Custodian'
    return (E.value as Reference).identifier.value)

define function SampleType(specimen FHIR.Specimen):
    case FHIRHelpers.ToCode(specimen.type.coding.where(system = 'https://fhir.bbmri.de/CodeSystem/SampleMaterialType').first())
       when Code 'plasma-edta' from SampleMaterialType then 'blood-plasma'
       when Code 'plasma-citrat' from SampleMaterialType then 'blood-plasma'
       when Code 'plasma-heparin' from SampleMaterialType then 'blood-plasma'
       when Code 'plasma-cell-free' from SampleMaterialType then 'blood-plasma'
       when Code 'plasma-other' from SampleMaterialType then 'blood-plasma'
       when Code 'plasma' from SampleMaterialType then 'blood-plasma'
       when Code 'tissue-formalin' from SampleMaterialType then 'tissue-ffpe'
       when Code 'tumor-tissue-ffpe' from SampleMaterialType then 'tissue-ffpe'
       when Code 'normal-tissue-ffpe' from SampleMaterialType then 'tissue-ffpe'
       when Code 'other-tissue-ffpe' from SampleMaterialType then 'tissue-ffpe'
       when Code 'tumor-tissue-frozen' from SampleMaterialType then 'tissue-frozen'
       when Code 'normal-tissue-frozen' from SampleMaterialType then 'tissue-frozen'
       when Code 'other-tissue-frozen' from SampleMaterialType then 'tissue-frozen'
       when Code 'tissue-paxgene-or-else' from SampleMaterialType then 'tissue-other'
       when Code 'derivative' from SampleMaterialType then 'derivative-other'
       when Code 'liquid' from SampleMaterialType then 'liquid-other'
       when Code 'tissue' from SampleMaterialType then 'tissue-other'
       when Code 'serum' from SampleMaterialType then 'blood-serum'
       when Code 'cf-dna' from SampleMaterialType then 'dna'
       when Code 'g-dna' from SampleMaterialType then 'dna'
       when Code 'blood-plasma' from SampleMaterialType then 'blood-plasma'
       when Code 'tissue-ffpe' from SampleMaterialType then 'tissue-ffpe'
       when Code 'tissue-frozen' from SampleMaterialType then 'tissue-frozen'
       when Code 'tissue-other' from SampleMaterialType then 'tissue-other'
       when Code 'derivative-other' from SampleMaterialType then 'derivative-other'
       when Code 'liquid-other' from SampleMaterialType then 'liquid-other'
       when Code 'blood-serum' from SampleMaterialType then 'blood-serum'
       when Code 'dna' from SampleMaterialType then 'dna'
       when Code 'buffy-coat' from SampleMaterialType then 'buffy-coat'
       when Code 'urine' from SampleMaterialType then 'urine'
       when Code 'ascites' from SampleMaterialType then 'ascites'
       when Code 'saliva' from SampleMaterialType then 'saliva'
       when Code 'csf-liquor' from SampleMaterialType then 'csf-liquor'
       when Code 'bone-marrow' from SampleMaterialType then 'bone-marrow'
       when Code 'peripheral-blood-cells-vital' from SampleMaterialType then 'peripheral-blood-cells-vital'
       when Code 'stool-faeces' from SampleMaterialType then 'stool-faeces'
       when Code 'rna' from SampleMaterialType then 'rna'
       when Code 'whole-blood' from SampleMaterialType then 'whole-blood'
       when Code 'swab' from SampleMaterialType then 'swab'
       when Code 'dried-whole-blood' from SampleMaterialType then 'dried-whole-blood'
       when null  then 'Unknown'
       else 'Unknown'
   end
define Specimen:
    if InInitialPopulation then [Specimen] S where (((S.type.coding.code contains 'blood-serum')) or
((S.type.coding.code contains 'tissue-frozen')) or
((S.type.coding.code contains 'serum')) or
((S.type.coding.code contains 'tumor-tissue-frozen')) or
((S.type.coding.code contains 'normal-tissue-frozen')) or
((S.type.coding.code contains 'other-tissue-frozen'))) else {} as List<Specimen>


define Diagnosis:
if InInitialPopulation then [Condition] else {} as List<Condition>

define function DiagnosisCode(condition FHIR.Condition):
condition.code.coding.where(system = 'http://fhir.de/CodeSystem/bfarm/icd-10-gm').code.first()

define function DiagnosisCode(condition FHIR.Condition, specimen FHIR.Specimen):
Coalesce(
  condition.code.coding.where(system = 'http://hl7.org/fhir/sid/icd-10').code.first(),
  condition.code.coding.where(system = 'http://fhir.de/CodeSystem/dimdi/icd-10-gm').code.first(),
  specimen.extension.where(url='https://fhir.bbmri.de/StructureDefinition/SampleDiagnosis').value.coding.code.first(),
  condition.code.coding.where(system = 'http://fhir.de/CodeSystem/bfarm/icd-10-gm').code.first()
  )

define InInitialPopulation:
(Patient.gender in { 'male', 'female' }) and
(exists from [Condition] C
where AgeInYearsAt(FHIRHelpers.ToDateTime(C.onset)) between Ceiling(10) and Ceiling(80)) and
)`;

        console.log(cql);
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
