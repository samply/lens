<script lang="ts">
    import {
        setCatalogue,
        setOptions,
        showErrorToast,
        translate,
        setSiteResult,
        getAst,
    } from "./src/index";
    import { facetCounts } from "./src/stores/facetCounts";

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
        chartOptions: {
            gender: {
                hintText: [
                    "This pie chart shows the proportion of males to females in our [population/data set]. The size of each section represents the percentage of individuals who identify as male or female.",
                ],
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
            infoButtonText: "This is a tooltip",
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
            infoButtonText: ["Diagnosis"],
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
                {
                    key: "somethinglong",
                    name: "This is a very long name for a blood group just to test the layout",
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
                                    description:
                                        "Diagnosis D43.% and Morph 9383/1,9384/1",
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
            infoButtonText: ["Sample ID"],
            type: "EQUALS",
            system: "",
        },
    ]);

    facetCounts.set({
        "blood-group": {
            "A+": 10,
            "A-": 5,
            "B+": 8,
            "B-": 2,
        },
        diagnosis: {
            C31: 40,
            "C31.0": 20,
            C41: 30,
            "C41.0": 10,
        },
    });

    window.addEventListener("lens-search-triggered", () => {
        console.log("AST:", JSON.stringify(getAst()));

        setTimeout(() => {
            setSiteResult("riverside", {
                totals: {
                    patients: 9,
                },
                stratifiers: {
                    gender: {
                        male: 5,
                        female: 4,
                        other: 0,
                    },
                    diagnosis: {
                        C31: 40,
                        "C31.0": 20,
                        C41: 30,
                        "41.0": 10,
                    },
                },
            });

            setSiteResult("summit", {
                stratifiers: {
                    gender: {
                        male: 12,
                        female: 18,
                        other: 3,
                    },
                    diagnosis: {
                        C31: 40,
                        "C31.0": 20,
                        C41: 30,
                        "41.0": 10,
                    },
                },
                totals: {
                    patients: 33,
                },
            });
        }, 1000);
    });

    function setLangAndReload(lang: string) {
        localStorage.setItem("language", lang);
        window.location.reload();
    }
</script>

<header style="padding: 10px;">
    <h2 style="margin: 0;">Lens Dev</h2>
</header>

<div style="display: flex; padding: 10px; gap: 10px;">
    <div style="flex: 1">
        <lens-search-bar-multiple></lens-search-bar-multiple>
    </div>
    <lens-query-explain-button noQueryMessage="Empty Query"
    ></lens-query-explain-button>
    <lens-search-button></lens-search-button>
    <lens-query-spinner></lens-query-spinner>
</div>

<div style="display: flex; padding: 10px; gap: 10px;">
    <div style="flex: 1">
        <lens-catalogue toggle={{ open: true }}></lens-catalogue>
    </div>
    <div style="flex: 1">
        <lens-result-summary></lens-result-summary>
        <lens-negotiate-button title="Request Data"></lens-negotiate-button>
        <lens-search-modified-display></lens-search-modified-display>
        <lens-result-table></lens-result-table>
        <div>
            <lens-chart
                title="Geschlecht"
                catalogueGroupCode="gender"
                chartType="pie"
                displayLegends="true"
            ></lens-chart>
            <lens-chart
                title="diagnosis"
                catalogueGroupCode="diagnosis"
                chartType="bar"
                xAxisTitle="ICD-10-Codes"
                yAxisTitle="Anzahl der Diagnosen"
            ></lens-chart>
            <lens-chart
                title="diagnosis"
                catalogueGroupCode="diagnosis"
                indexAxis="y"
                scaleType="logarithmic"
                chartType="bar"
                xAxisTitle="Anzahl der Diagnosen"
                yAxisTitle="ICD-10-Codes"
            ></lens-chart>
        </div>
    </div>
</div>

<footer style="display: flex; padding: 10px; gap: 10px;">
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
    <span
        >Made with ♥ and <a href="https://github.com/samply/lens"
            >samply/lens</a
        >.</span
    >
</footer>

<error-toasts></error-toasts>
