<script lang="ts">
    import {
        setCatalogue,
        setOptions,
        translate,
        setSiteResult,
        getAst,
        showToast,
        markSiteClaimed,
        clearSiteResults,
        getHumanReadableQueryAsFormattedString,
    } from "./src/index";
    import { facetCounts } from "./src/stores/facetCounts";

    setOptions({
        language: localStorage.getItem("language") || "en",
        texts: {
            "lens-dev-test-error": {
                en: "Task failed successfully.",
                de: "Aufgabe erfolgreich fehlgeschlagen.",
            },
            "lens-dev-test-info": {
                en: "Task sent successfully.",
                de: "Aufgabe erfolgreich gesendet.",
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
                {
                    fieldType: "date",
                    key: "date-of-diagnosis",
                    name: "Date of diagnosis",
                    type: "BETWEEN",
                    system: "",
                    max: "2025-09-04",
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
        clearSiteResults();
        markSiteClaimed("riverside");
        markSiteClaimed("summit");
        for (const site of "ABCDEFGHIJ") {
            markSiteClaimed("Site " + site);
        }

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

            for (const site of "ABCDEFGHIJ") {
                setSiteResult("Site " + site, {
                    totals: {},
                    stratifiers: {},
                });
            }
        }, 1000);
    });

    function setLangAndReload(lang: string) {
        localStorage.setItem("language", lang);
        window.location.reload();
    }

    window.addEventListener("lens-negotiate-triggered", () => {
        const body = encodeURIComponent(
            getHumanReadableQueryAsFormattedString(true),
        );

        const a = document.createElement("a");
        a.href = `mailto:request@example.com?body=${body}`;

        a.click();
    });
</script>

<div id="main-wrapper">
    <header class="card">
        <h1>Lens Demo</h1>
        <div>
            <button
                onclick={() =>
                    showToast(translate("lens-dev-test-error"), "error")}
            >
                Error toast test
            </button>
            <button
                onclick={() =>
                    showToast(translate("lens-dev-test-info"), "info")}
            >
                Info toast test
            </button>
            <button onclick={() => setLangAndReload("en")}>🇬🇧</button>
            <button onclick={() => setLangAndReload("de")}>🇩🇪</button>
        </div>
    </header>
    <div id="search-wrapper">
        <lens-search-bar-multiple></lens-search-bar-multiple>
        <lens-query-explain-button></lens-query-explain-button>
        <lens-query-spinner></lens-query-spinner>
        <lens-search-button></lens-search-button>
    </div>
    <div id="catalogue-and-grid-wrapper">
        <div id="catalogue" class="card">
            <lens-catalogue toggle={{ collapsable: false }}></lens-catalogue>
        </div>
        <div id="main-grid">
            <div id="result-summary" class="card">
                <lens-result-summary></lens-result-summary>
                <lens-search-modified-display></lens-search-modified-display>
            </div>
            <div id="result-table" class="card">
                <lens-result-table pageSize={10}></lens-result-table>
                <lens-negotiate-button></lens-negotiate-button>
            </div>
            <div class="card">
                <lens-chart
                    title="Gender distribution"
                    dataKey="gender"
                    chartType="pie"
                    displayLegends={true}
                ></lens-chart>
            </div>
            <div class="card">
                <lens-chart
                    title="Diagnosis distribution"
                    dataKey="diagnosis"
                    chartType="bar"
                    xAxisTitle="ICD-10 Code"
                    yAxisTitle="Number of cases"
                ></lens-chart>
            </div>
            <div class="card">
                <lens-chart
                    title="Diagnosis distribution (alternative)"
                    dataKey="diagnosis"
                    chartType="bar"
                    indexAxis="y"
                    scaleType="logarithmic"
                    xAxisTitle="Number of cases"
                    yAxisTitle="ICD-10 Code"
                ></lens-chart>
            </div>
        </div>
    </div>
    <footer class="card">
        <span>
            Made with ♥ and
            <a href="https://github.com/samply/lens">samply/lens</a>
        </span>
    </footer>
</div>

<lens-toast></lens-toast>

<style>
    #main-wrapper {
        padding: var(--gap-xs);
        gap: var(--gap-xs);
        background-color: #f8f8ff;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .card {
        background-color: white;
        border-radius: var(--border-radius-small);
        border: 1px solid var(--lightest-gray);
        padding: var(--gap-xs);
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h1 {
            color: var(--blue);
            margin: 0;
        }
    }

    #search-wrapper {
        display: flex;
        gap: var(--gap-xs);
        align-items: center;
        lens-search-bar-multiple {
            flex: 1;
        }
    }

    #catalogue-and-grid-wrapper {
        flex: 1;
        overflow: hidden;
        display: flex;
        gap: var(--gap-xs);
    }

    #catalogue {
        flex: 1;
        max-width: 30rem;
        overflow-y: auto;
    }

    #main-grid {
        flex: 1;
        overflow-y: auto;

        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--gap-xs);

        #result-summary {
            grid-column: 1 / -1;
        }
    }

    #result-table {
        display: flex;
        flex-direction: column;
        gap: var(--gap-s);
    }

    footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
