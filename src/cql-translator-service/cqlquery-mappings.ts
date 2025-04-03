export const alias = new Map<string, string>([
  ["icd10", "http://fhir.de/CodeSystem/bfarm/icd-10-gm"],
  ["loinc", "http://loinc.org"],
  ["gradingcs", "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/GradingCS"],
  ["ops", "http://fhir.de/CodeSystem/bfarm/ops"],
  ["morph", "urn:oid:2.16.840.1.113883.6.43.1"],
  ["lokalisation_icd_o_3", "urn:oid:2.16.840.1.113883.6.43.1"],
  [
    "bodySite",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/SeitenlokalisationCS",
  ],
  [
    "Therapieart",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/SYSTTherapieartCS",
  ],
  ["specimentype", "https://fhir.bbmri.de/CodeSystem/SampleMaterialType"],
  [
    "uiccstadiumcs",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/UiccstadiumCS",
  ],
  [
    "lokalebeurteilungresidualstatuscs",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/LokaleBeurteilungResidualstatusCS",
  ],
  [
    "gesamtbeurteilungtumorstatuscs",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/GesamtbeurteilungTumorstatusCS",
  ],
  [
    "verlauflokalertumorstatuscs",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/VerlaufLokalerTumorstatusCS",
  ],
  [
    "verlauftumorstatuslymphknotencs",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/VerlaufTumorstatusLymphknotenCS",
  ],
  [
    "verlauftumorstatusfernmetastasencs",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/VerlaufTumorstatusFernmetastasenCS",
  ],
  [
    "vitalstatuscs",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/VitalstatusCS",
  ],
  ["jnucs", "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/JNUCS"],
  [
    "fmlokalisationcs",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/FMLokalisationCS",
  ],
  ["TNMTCS", "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/TNMTCS"],
  ["TNMNCS", "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/TNMNCS"],
  ["TNMMCS", "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/TNMMCS"],
  [
    "TNMySymbolCS",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/TNMySymbolCS",
  ],
  [
    "TNMrSymbolCS",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/TNMrSymbolCS",
  ],
  [
    "TNMmSymbolCS",
    "http://dktk.dkfz.de/fhir/onco/core/CodeSystem/TNMmSymbolCS",
  ],
  ["molecularMarker", "http://www.genenames.org"],

  ["BBMRI_icd10", "http://hl7.org/fhir/sid/icd-10"],
  ["BBMRI_icd10gm", "http://fhir.de/CodeSystem/dimdi/icd-10-gm"],
  [
    "BBMRI_SampleMaterialType",
    "https://fhir.bbmri.de/CodeSystem/SampleMaterialType",
  ], //specimentype
  [
    "BBMRI_StorageTemperature",
    "https://fhir.bbmri.de/CodeSystem/StorageTemperature",
  ],
  [
    "BBMRI_SmokingStatus",
    "http://hl7.org/fhir/uv/ips/ValueSet/current-smoking-status-uv-ips",
  ],
]);

export const cqltemplate = new Map<string, string>([
  ["gender", "Patient.gender = '{{C}}'"],
  [
    "pseudo_projects",
    "  exists ( Patient.extension E where E.url = 'http://dktk.dkfz.de/fhir/projects/{{C}}')",
  ],
  ["conditionValue", "exists [Condition: Code '{{C}}' from {{A1}}]"],
  [
    "conditionBodySite",
    "exists from [Condition] C\nwhere C.bodySite.coding contains Code '{{C}}' from {{A1}}",
  ],
  //TODO Revert to first expression if https://github.com/samply/blaze/issues/808 is solved
  // ["conditionLocalization", "exists from [Condition] C\nwhere C.bodySite.coding contains Code '{{C}}' from {{A1}}"],
  [
    "conditionLocalization",
    "exists from [Condition] C\nwhere C.bodySite.coding.code contains '{{C}}'",
  ],
  [
    "conditionRangeDate",
    "exists from [Condition] C\nwhere year from C.onset between {{D1}} and {{D2}}",
  ],
  [
    "conditionLowerThanDate",
    "exists from [Condition] C\nwhere year from C.onset <= {{D2}}",
  ],
  [
    "conditionGreaterThanDate",
    "exists from [Condition] C\nwhere year from C.onset >= {{D1}}",
  ],
  [
    "conditionRangeAge",
    "exists [Condition] C\nwhere AgeInYearsAt(FHIRHelpers.ToDateTime(C.onset)) between {{D1}} and {{D2}}",
  ],
  [
    "conditionLowerThanAge",
    "exists [Condition] C\nwhere AgeInYearsAt(FHIRHelpers.ToDateTime(C.onset)) <= {{D2}}",
  ],
  [
    "conditionGreaterThanAge",
    "exists [Condition] C\nwhere AgeInYearsAt(FHIRHelpers.ToDateTime(C.onset)) >= {{D1}}",
  ],
  [
    "primaryConditionRangeDate",
    "year from PrimaryDiagnosis.onset between {{D1}} and {{D2}}",
  ],
  [
    "primaryConditionLowerThanDate",
    "year from PrimaryDiagnosis.onset <= {{D2}}",
  ],
  [
    "primaryConditionGreaterThanDate",
    "year from PrimaryDiagnosis.onset >= {{D1}}",
  ],
  [
    "primaryConditionRangeAge",
    "AgeInYearsAt(FHIRHelpers.ToDateTime(PrimaryDiagnosis.onset)) between {{D1}} and {{D2}}",
  ],
  [
    "primaryConditionLowerThanAge",
    "AgeInYearsAt(FHIRHelpers.ToDateTime(PrimaryDiagnosis.onset)) <= {{D2}}",
  ],
  [
    "primaryConditionGreaterThanAge",
    "AgeInYearsAt(FHIRHelpers.ToDateTime(PrimaryDiagnosis.onset)) >= {{D1}}",
  ],
  //TODO Revert to first expression if https://github.com/samply/blaze/issues/808 is solved
  // ["observation", "exists from [Observation: Code '{{K}}' from {{A1}}] O\nwhere O.value.coding contains Code '{{C}}' from {{A2}}"],
  [
    "observation",
    "exists from [Observation: Code '{{K}}' from {{A1}}] O\nwhere O.value.coding.code contains '{{C}}'",
  ],
  [
    "observationMetastasis",
    "exists from [Observation: Code '21907-1' from {{A1}}] O\nwhere O.value.coding.code contains '{{C}}'",
  ],
  [
    "observationMetastasisBodySite",
    "exists from [Observation: Code '21907-1' from {{A1}}] O\nwhere O.bodySite.coding.code contains '{{C}}'",
  ],
  [
    "observationMolecularMarkerName",
    "exists from [Observation: Code '69548-6' from {{A1}}] O\nwhere O.component.where(code.coding contains Code '{{K}}' from {{A1}}).value.coding contains Code '{{C}}' from {{A2}}",
  ],
  [
    "observationMolecularMarkerAminoacidchange",
    "exists from [Observation: Code '69548-6' from {{A1}}] O\nwhere O.component.where(code.coding contains Code '{{K}}' from {{A1}}).value = '{{C}}'",
  ], //TODO @ThomasK replace C with S
  [
    "observationMolecularMarkerDNAchange",
    "exists from [Observation: Code '69548-6' from {{A1}}] O\nwhere O.component.where(code.coding contains Code '{{K}}' from {{A1}}).value = '{{C}}'",
  ],
  [
    "observationMolecularMarkerSeqRefNCBI",
    "exists from [Observation: Code '69548-6' from {{A1}}] O\nwhere O.component.where(code.coding contains Code '{{K}}' from {{A1}}).value = '{{C}}'",
  ],
  [
    "observationMolecularMarkerEnsemblID",
    "exists from [Observation: Code '69548-6' from {{A1}}] O\nwhere O.component.where(code.coding contains Code '{{K}}' from {{A1}}).value = '{{C}}'",
  ],
  ["procedure", "exists [Procedure: category in Code '{{K}}' from {{A1}}]"],
  [
    "procedureResidualstatus",
    "exists from [Procedure: category in Code 'OP' from {{A1}}] P\nwhere P.outcome.coding.code contains '{{C}}'",
  ],
  [
    "medicationStatement",
    "exists [MedicationStatement: category in Code '{{K}}' from {{A1}}]",
  ],
  ["hasSpecimen", "exists [Specimen]"],
  ["specimen", "exists [Specimen: Code '{{C}}' from {{A1}}]"],
  ["retrieveSpecimenByType", "(S.type.coding.code contains '{{C}}')"],
  [
    "TNMc",
    "exists from [Observation: Code '21908-9' from {{A1}}] O\nwhere O.component.where(code.coding contains Code '{{K}}' from {{A1}}).value.coding contains Code '{{C}}' from {{A2}}",
  ],
  [
    "TNMp",
    "exists from [Observation: Code '21902-2' from {{A1}}] O\nwhere O.component.where(code.coding contains Code '{{K}}' from {{A1}}).value.coding contains Code '{{C}}' from {{A2}}",
  ],
  [
    "Organization",
    "Patient.managingOrganization.reference = \"Organization Ref\"('Klinisches Krebsregister/ITM')",
  ],
  [
    "department",
    "exists from [Encounter] I\nwhere I.identifier.value = '{{C}}' ",
  ],
  [
    "uiccstadium",
    "(exists ([Observation: Code '21908-9' from loinc] O where O.value.coding.code contains '{{C}}')) or (exists ([Observation: Code '21902-2' from loinc] O where O.value.coding.code contains '{{C}}'))",
  ],
  ["histology", "exists from [Observation: Code '59847-4' from loinc] O\n"],
]);

export const criterionMap = new Map<string, { type: string; alias?: string[] }>(
  [
    ["gender", { type: "gender" }],
    ["pseudo_projects", { type: "pseudo_projects" }],
    ["histology", { type: "histology", alias: ["loinc"] }],
    ["diagnosis", { type: "conditionValue", alias: ["icd10"] }],
    ["bodySite", { type: "conditionBodySite", alias: ["bodySite"] }],
    [
      "urn:oid:2.16.840.1.113883.6.43.1",
      { type: "conditionLocalization", alias: ["lokalisation_icd_o_3"] },
    ],
    ["59542-1", { type: "observation", alias: ["loinc", "gradingcs"] }], //grading
    [
      "metastases_present",
      { type: "observationMetastasis", alias: ["loinc", "jnucs"] },
    ], //Fernmetastasen vorhanden
    [
      "localization_metastases",
      {
        type: "observationMetastasisBodySite",
        alias: ["loinc", "fmlokalisationcs"],
      },
    ], //Fernmetastasen
    ["OP", { type: "procedure", alias: ["Therapieart"] }], //Operation
    ["ST", { type: "procedure", alias: ["Therapieart"] }], //Strahlentherapie
    ["CH", { type: "medicationStatement", alias: ["Therapieart"] }], //Chemotherapie
    ["HO", { type: "medicationStatement", alias: ["Therapieart"] }], //Hormontherapie
    ["IM", { type: "medicationStatement", alias: ["Therapieart"] }], //Immuntherapie
    ["KM", { type: "medicationStatement", alias: ["Therapieart"] }], //Knochenmarktransplantation
    ["59847-4", { type: "observation", alias: ["loinc", "morph"] }], //Morphologie
    ["year_of_diagnosis", { type: "conditionRangeDate" }],
    ["year_of_primary_diagnosis", { type: "primaryConditionRangeDate" }],
    ["sample_kind", { type: "specimen", alias: ["specimentype"] }],
    ["pat_with_samples", { type: "hasSpecimen" }],
    ["age_at_diagnosis", { type: "conditionRangeAge" }],
    ["age_at_primary_diagnosis", { type: "primaryConditionRangeAge" }],
    ["21908-9", { type: "uiccstadium", alias: ["loinc", "uiccstadiumcs"] }],
    ["21905-5", { type: "TNMc", alias: ["loinc", "TNMTCS"] }], //tnm component
    ["21906-3", { type: "TNMc", alias: ["loinc", "TNMNCS"] }], //tnm component
    ["21907-1", { type: "TNMc", alias: ["loinc", "TNMMCS"] }], //tnm component
    ["42030-7", { type: "TNMc", alias: ["loinc", "TNMmSymbolCS"] }], //tnm component
    ["59479-6", { type: "TNMc", alias: ["loinc", "TNMySymbolCS"] }], //tnm component
    ["21983-2", { type: "TNMc", alias: ["loinc", "TNMrSymbolCS"] }], //tnm component
    ["21899-0", { type: "TNMp", alias: ["loinc", "TNMTCS"] }], //tnm component
    ["21900-6", { type: "TNMp", alias: ["loinc", "TNMNCS"] }], //tnm component
    ["21901-4", { type: "TNMp", alias: ["loinc", "TNMMCS"] }], //tnm component
    ["42030-7", { type: "TNMp", alias: ["loinc", "TNMmSymbolCS"] }], //tnm component
    ["59479-6", { type: "TNMp", alias: ["loinc", "TNMySymbolCS"] }], //tnm component
    ["21983-2", { type: "TNMp", alias: ["loinc", "TNMrSymbolCS"] }], //tnm component

    ["Organization", { type: "Organization" }], //organization
    [
      "48018-6",
      {
        type: "observationMolecularMarkerName",
        alias: ["loinc", "molecularMarker"],
      },
    ], //molecular marker name
    [
      "48005-3",
      {
        type: "observationMolecularMarkerAminoacidchange",
        alias: ["loinc"],
      },
    ], //molecular marker
    [
      "81290-9",
      { type: "observationMolecularMarkerDNAchange", alias: ["loinc"] },
    ], //molecular marker
    [
      "81248-7",
      { type: "observationMolecularMarkerSeqRefNCBI", alias: ["loinc"] },
    ], //molecular marker
    [
      "81249-5",
      { type: "observationMolecularMarkerEnsemblID", alias: ["loinc"] },
    ], //molecular marker

    [
      "local_assessment_residual_tumor",
      {
        type: "procedureResidualstatus",
        alias: ["Therapieart", "lokalebeurteilungresidualstatuscs"],
      },
    ], //lokalebeurteilungresidualstatuscs
    [
      "21976-6",
      {
        type: "observation",
        alias: ["loinc", "gesamtbeurteilungtumorstatuscs"],
      },
    ], //GesamtbeurteilungTumorstatus
    [
      "LA4583-6",
      {
        type: "observation",
        alias: ["loinc", "verlauflokalertumorstatuscs"],
      },
    ], //LokalerTumorstatus
    [
      "LA4370-8",
      {
        type: "observation",
        alias: ["loinc", "verlauftumorstatuslymphknotencs"],
      },
    ], //TumorstatusLymphknoten
    [
      "LA4226-2",
      {
        type: "observation",
        alias: ["loinc", "verlauftumorstatusfernmetastasencs"],
      },
    ], //TumorstatusFernmetastasen
    ["75186-7", { type: "observation", alias: ["loinc", "vitalstatuscs"] }], //Vitalstatus
    //["Organization", {type: "Organization"}],
    ["Organization", { type: "department" }],
  ],
);
