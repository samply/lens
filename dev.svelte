<script lang="ts">
    import {
        setCatalogue,
        setOptions,
        showErrorToast,
        translate,
    } from "./src/index";
    import type { QueryEvent, Site } from "./src/index";

    setOptions({
        language: localStorage.getItem("language") || "en",
        texts: {
            "lens-dev-test-error": {
                en: "Task failed successfully.",
                de: "Aufgabe erfolgreich fehlgeschlagen.",
            },
        },
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
            fieldType: "autocomplete",
            key: "diagnosis",
            name: "Diagnosis",
            type: "EQUALS",
            system: "http://fhir.de/CodeSystem/dimdi/icd-10-gm",
            criteria: [
                {
                    key: "C31",
                    name: "C31",
                    description: "Malignant neoplasm of accessory sinuses",
                },
                {
                    key: "C31.0",
                    name: "C31.0",
                    description: "Malignant neoplasm: Maxillary sinus",
                },
                {
                    key: "C41",
                    name: "C41",
                    description:
                        "Malignant neoplasm of bone and articular cartilage of other and unspecified sites",
                },
                {
                    key: "C41.0",
                    name: "C41.0",
                    description: "Malignant neoplasm: Bones of skull and face",
                },
                {
                    key: "C41.1",
                    name: "C41.1",
                    description: "Malignant neoplasm: Bones of vertebrae",
                },
                {
                    key: "C41.2",
                    name: "C41.2",
                    description: "Malignant neoplasm: Bones of pelvis",
                },
            ],
        },
        {
            fieldType: "single-select",
            key: "blood-group",
            name: "Blood group",
            type: "EQUALS",
            system: "",
            criteria: [
                {
                    key: "A+",
                    name: "A+",
                    description: "",
                },
                {
                    key: "A-",
                    name: "A-",
                    description: "",
                },
                {
                    key: "B+",
                    name: "B+",
                    description: "",
                },
                {
                    key: "B-",
                    name: "B-",
                    description: "",
                },
            ],
        },
        {
            fieldType: "number",
            key: "body_weight",
            name: "Body weight",
            type: "BETWEEN",
            system: "",
            min: 0,
            unitText: "kg",
        },
        {
            fieldType: "date",
            key: "date-of-birth",
            name: "Date of birth",
            type: "BETWEEN",
            system: "",
            max: "2025-09-04",
        },
        {
            fieldType: "string",
            key: "first-name",
            name: "First name",
            type: "EQUALS",
            system: "",
        },
        {
            fieldType: "group",
            key: "donor",
            name: "Donor/Clinical Information",
            childCategories: [
                {
                    key: "gender",
                    name: "Gender",
                    fieldType: "single-select",
                    type: "EQUALS",
                    system: "",
                    criteria: [
                        {
                            key: "male",
                            name: "male",
                            description: "",
                        },
                        {
                            key: "female",
                            name: "female",
                            description: "",
                        },
                        {
                            key: "other",
                            name: "other",
                            description: "",
                        },
                        {
                            key: "sex_uncharted",
                            name: "sex uncharted",
                            description: "",
                        },
                    ],
                },
                {
                    key: "diagnosis",
                    name: "Diagnosis ICD-10",
                    fieldType: "autocomplete",
                    type: "EQUALS",
                    system: "http://fhir.de/CodeSystem/dimdi/icd-10-gm",
                    criteria: [
                        {
                            key: "C31",
                            name: "C31",
                            description:
                                "Malignant neoplasm of accessory sinuses",
                        },
                        {
                            key: "C31.0",
                            name: "C31.0",
                            description: "Malignant neoplasm: Maxillary sinus",
                        },
                        {
                            key: "C41",
                            name: "C41",
                            description:
                                "Malignant neoplasm of bone and articular cartilage of other and unspecified sites",
                        },
                        {
                            key: "C41.0",
                            name: "C41.0",
                            description:
                                "Malignant neoplasm: Bones of skull and face",
                        },
                    ],
                },
                {
                    key: "age_at_diagnosis",
                    name: "Diagnosis age",
                    fieldType: "number",
                    type: "BETWEEN",
                    system: "",
                },
            ],
        },
        {
            fieldType: "group",
            key: "tumor_entity",
            name: "Tumorentität",
            childCategories: [
                {
                    fieldType: "group",
                    key: "urn:dktk:code:2:2",
                    name: "Neuroonkologie",
                    childCategories: [
                        {
                            key: "gliom_all_groups",
                            name: "Gliome, alle Gruppen",
                            fieldType: "single-select",
                            type: "EQUALS",
                            system: "",
                            criteria: [
                                {
                                    key: "urn:dktk:code:3:2",
                                    name: "Gliom - Grad I",
                                    description: "",
                                    aggregatedValue: [
                                        [
                                            {
                                                value: "diagnosis",
                                                name: "D43.%",
                                            },
                                        ],
                                        [
                                            {
                                                value: "59847-4",
                                                name: "9383/1",
                                            },
                                            {
                                                value: "59847-4",
                                                name: "9384/1",
                                            },
                                            {
                                                value: "59847-4",
                                                name: "9394/1",
                                            },
                                            {
                                                value: "59847-4",
                                                name: "9421/1",
                                            },
                                        ],
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            fieldType: "string",
            key: "sample-id",
            name: "Sample ID",
            type: "EQUALS",
            system: "",
        },
    ]);

    function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    window.addEventListener("emit-lens-query", (event) => {
        const detail = (event as QueryEvent).detail;
        console.log("AST:", JSON.stringify(detail.ast));
        sleep(3000).then(() => {
            detail.updateResponse(new Map([["riverside", makeSite(5, 4, 0)]]));
            detail.updateResponse(new Map([["summit", makeSite(12, 18, 3)]]));
        });
    });

    function setLangAndReload(lang: string) {
        localStorage.setItem("language", lang);
        window.location.reload();
    }

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
</script>

<header>
    <h2>Lens Dev</h2>
</header>
<div class="searchbar">
    <lens-search-bar></lens-search-bar>
    <lens-query-spinner></lens-query-spinner>
    <lens-search-button></lens-search-button>
</div>
<div class="container">
    <div class="box">
        <lens-catalogue toggle={{ open: true }}></lens-catalogue>
    </div>
    <div class="box2">
        <lens-result-summary></lens-result-summary>
        <lens-result-table></lens-result-table>
        <lens-chart
            title="Geschlecht"
            catalogueGroupCode="gender"
            chartType="pie"
            displayLegends="true"
        ></lens-chart>
    </div>
</div>
<button
    id="error-toast-test-button"
    onclick={() => showErrorToast(translate("lens-dev-test-error"))}
    >Error toast test</button
>
<button
    id="switch-language-to-german-button"
    onclick={() => setLangAndReload("de")}>🇩🇪</button
><button
    id="switch-language-to-english-button"
    onclick={() => setLangAndReload("en")}>🇬🇧</button
>
<error-toasts></error-toasts>

<footer>
    Made with ♥ and
    <a href="https://github.com/samply/lens">samply/lens</a>.
</footer>

<style>
    :root {
        padding-left: 100px;
        padding-right: 100px;
    }
    header {
        background-color: ghostwhite;
    }
    footer {
        background-color: ghostwhite;
    }
    .container {
        display: flex;
    }
    .searchbar {
        display: grid;
        grid-template-columns: 25fr 1fr 1fr;
        align-items: center;
    }
    .box {
        padding: 10px;
        padding: 1em;
        width: 600px;
    }
    .box2 {
        flex-grow: 1;
    }
</style>
