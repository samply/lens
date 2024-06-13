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

    [
        // Used by ECDC/EHDS2
        "patientAge",
        "AgeInYears between {{D1}} and {{D2}}",
    ],
    [
        // Used by ECDC/EHDS2
        "patientHospitalUnitType",
        "HospitalUnitType = '{{C}}'",
    ],
    [
        // Used by ECDC/EHDS2
        "patientHospitalId",
        "HospitalId = '{{C}}'",
    ],
    [
        // Used by ECDC/EHDS2
        "patientLaboratoryCode",
        "LaboratoryCode = '{{C}}'",
    ],
    [
        // Used by ECDC/EHDS2
        "observationPathogenCode",
        "ExistsPathogenCode('{{C}}')",
    ],
    [
        // Used by ECDC/EHDS2
        "observationAntibioticCode",
        "ExistsAntibioticCode('{{C}}')",
    ],
    [
        // Used by ECDC/EHDS2
        "observationSirCode",
        "ExistsSirCode('{{C}}')",
    ],
    [
        // Used by ECDC/EHDS2
        "observationDataSource",
        "ExistsDataSource('{{C}}')",
    ],
    [
        // Used by ECDC/EHDS2
        "observationIsolateId",
        "ExistsSpecimenIsolateId('{{C}}')", // From Specimen
    ],
    [
        // Used by ECDC/EHDS2
        "observationPatientType",
        "ExistsPatientType('{{C}}')",
    ],
    [
        // Used by ECDC/EHDS2
        "observationReferenceGuidelinesSir",
        "ExistsReferenceGuidelinesSir('{{C}}')",
    ],
    [
        // Used by ECDC/EHDS2
        "observationReportingCountry",
        "ExistsReportingCountry('{{C}}')",
    ],
    [
        // Used by ECDC/EHDS2
        "observationDateValidFrom",
        "exists from [Observation] O where ToDate(O.effective as dateTime) in Interval[@{{D1}}, @{{D2}}]",
    ],
    [
        // Used by ECDC/EHDS2
        "observationDateUsedForStatistics",
        "exists from [Observation] O where ToDate(O.issued) in Interval[@{{D1}}, @{{D2}}]",
    ],

    ["BBMRI_gender", "Patient.gender"],
    [
        "BBMRI_conditionSampleDiagnosis",
        "((exists[Condition: Code '{{C}}' from {{A1}}]) or (exists[Condition: Code '{{C}}' from {{A2}}])) or (exists from [Specimen] S where (S.extension.where(url='https://fhir.bbmri.de/StructureDefinition/SampleDiagnosis').value.coding.code contains '{{C}}'))",
    ],
    ["BBMRI_conditionValue", "exists [Condition: Code '{{C}}' from {{A1}}]"],
    [
        "BBMRI_conditionRangeDate",
        "exists from [Condition] C\nwhere FHIRHelpers.ToDateTime(C.onset) between {{D1}} and {{D2}}",
    ],
    [
        "BBMRI_conditionRangeAge",
        "exists from [Condition] C\nwhere AgeInYearsAt(FHIRHelpers.ToDateTime(C.onset)) between Ceiling({{D1}}) and Ceiling({{D2}})",
    ],
    ["BBMRI_age", "AgeInYears() between Ceiling({{D1}}) and Ceiling({{D2}})"],
    [
        "BBMRI_observation",
        "exists from [Observation: Code '{{K}}' from {{A1}}] O\nwhere O.value.coding.code contains '{{C}}'",
    ],
    [
        "BBMRI_observationSmoker",
        "exists from [Observation: Code '72166-2' from {{A1}}] O\nwhere O.value.coding.code contains '{{C}}'",
    ],
    [
        "BBMRI_observationRange",
        "exists from [Observation: Code '{{K}}' from {{A1}}] O\nwhere O.value between {{D1}} and {{D2}}",
    ],
    [
        "BBMRI_observationBodyWeight",
        "exists from [Observation: Code '29463-7' from {{A1}}] O\nwhere ((O.value as Quantity) < {{D1}} 'kg' and (O.value as Quantity) > {{D2}} 'kg')",
    ],
    [
        "BBMRI_observationBMI",
        "exists from [Observation: Code '39156-5' from {{A1}}] O\nwhere ((O.value as Quantity) < {{D1}} 'kg/m2' and (O.value as Quantity) > {{D2}} 'kg/m2')",
    ],
    ["BBMRI_hasSpecimen", "exists [Specimen]"],
    ["BBMRI_specimen", "exists [Specimen: Code '{{C}}' from {{A1}}]"],
    ["BBMRI_retrieveSpecimenByType", "(S.type.coding.code contains '{{C}}')"],
    [
        "BBMRI_retrieveSpecimenByTemperature",
        "(S.extension.where(url='https://fhir.bbmri.de/StructureDefinition/StorageTemperature').value.coding.code contains '{{C}}')",
    ],
    [
        "BBMRI_retrieveSpecimenBySamplingDate",
        "(FHIRHelpers.ToDateTime(S.collection.collected) between {{D1}} and {{D2}})",
    ],
    [
        "BBMRI_retrieveSpecimenByFastingStatus",
        "(S.collection.fastingStatus.coding.code contains '{{C}}')",
    ],
    [
        "BBMRI_samplingDate",
        "exists from [Specimen] S\nwhere FHIRHelpers.ToDateTime(S.collection.collected) between {{D1}} and {{D2}}",
    ],
    [
        "BBMRI_fastingStatus",
        "exists from [Specimen] S\nwhere S.collection.fastingStatus.coding.code contains '{{C}}'",
    ],
    [
        "BBMRI_storageTemperature",
        "exists from [Specimen] S where (S.extension.where(url='https://fhir.bbmri.de/StructureDefinition/StorageTemperature').value.coding contains Code '{{C}}' from {{A1}})",
    ],
]);

export const criterionMap = new Map<string, { type: string; alias?: string[] }>(
    [
        ["gender", { type: "gender" }],
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

        // Used by ECDC/EHDS2
        ["age", { type: "patientAge" }],
        ["hospital_unit_type", { type: "patientHospitalUnitType" }],
        ["hospital_id", { type: "patientHospitalId" }],
        ["laboratory_code", { type: "patientLaboratoryCode" }],
        ["pathogen_code", { type: "observationPathogenCode" }],
        ["antibiotic_code", { type: "observationAntibioticCode" }],
        ["sir_code", { type: "observationSirCode" }],
        ["data_source", { type: "observationDataSource" }],
        ["isolate_id", { type: "observationIsolateId" }],
        ["patient_type", { type: "observationPatientType" }],
        [
            "reference_guidelines_sir",
            { type: "observationReferenceGuidelinesSir" },
        ],
        ["reporting_country", { type: "observationReportingCountry" }],
        ["date_valid_from", { type: "observationDateValidFrom" }],
        [
            "date_used_for_statistics",
            { type: "observationDateUsedForStatistics" },
        ],

        ["BBMRI_gender", { type: "BBMRI_gender" }],
        [
            "BBMRI_diagnosis",
            {
                type: "BBMRI_conditionSampleDiagnosis",
                alias: ["BBMRI_icd10", "BBMRI_icd10gm"],
            },
        ],
        [
            "BBMRI_body_weight",
            { type: "BBMRI_observationBodyWeight", alias: ["loinc"] },
        ], //Body weight
        ["BBMRI_bmi", { type: "BBMRI_observationBMI", alias: ["loinc"] }], //BMI
        [
            "BBMRI_smoking_status",
            { type: "BBMRI_observationSmoker", alias: ["loinc"] },
        ], //Smoking habit
        ["BBMRI_donor_age", { type: "BBMRI_age" }],
        ["BBMRI_date_of_diagnosis", { type: "BBMRI_conditionRangeDate" }],
        [
            "BBMRI_sample_kind",
            { type: "BBMRI_specimen", alias: ["BBMRI_SampleMaterialType"] },
        ],
        [
            "BBMRI_storage_temperature",
            {
                type: "BBMRI_storageTemperature",
                alias: ["BBMRI_StorageTemperature"],
            },
        ],
        ["BBMRI_pat_with_samples", { type: "BBMRI_hasSpecimen" }],
        ["BBMRI_diagnosis_age_donor", { type: "BBMRI_conditionRangeAge" }],
        [
            "BBMRI_fasting_status",
            { type: "BBMRI_fastingStatus", alias: ["loinc"] },
        ],
        ["BBMRI_sampling_date", { type: "BBMRI_samplingDate" }],
    ],
);
