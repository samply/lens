<script lang="ts">
    import {
        setCatalogue,
        setOptions,
        translate,
        setSiteResult,
        getAst,
        showToast,
        markSiteClaimed,
        removeFailedSite,
        setFacetCounts,
        clearSiteResults,
        getHumanReadableQueryAsFormattedString,
        type Catalogue,
    } from "./src/index";
    import { Check, X } from "lucide-svelte";
    import { filterCatalogue } from "./src/components/catalogue/catalogue-transform";
    import catalogue from "./src/catalogue/napkon-test-catalogue.json";
    import {
        studyState,
        getSelectedStudies,
    } from "c:/IntelliJ - Projekte/lens2-(svelte)/src/components/catalogue/study-state.svelte";

    const barChartBackgroundColors: string[] = ["#052c65", "#0d6efd"];
    const barChartHoverColors: string[] = ["#000000"];

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
            failingsite: "Failing Site",
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

    setCatalogue(catalogue as Catalogue);
    /*setCatalogue([
        {
            fieldType: "autocomplete",
            key: "diagnosis",
            name: "Diagnosis",
            type: "EQUALS",
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
            min: 0,
            unitText: "kg",
        },
        {
            fieldType: "date",
            key: "date-of-birth",
            name: "Date of birth",
            type: "BETWEEN",
            max: "2025-09-04",
        },
        {
            fieldType: "string",
            key: "first-name",
            name: "First name",
            type: "EQUALS",
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
                },
                {
                    fieldType: "date",
                    key: "date-of-diagnosis",
                    name: "Date of diagnosis",
                    type: "BETWEEN",
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
        },
    ]);*/

    setFacetCounts({
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

        setTimeout(() => {
            markSiteClaimed("riverside");
            markSiteClaimed("summit");
            markSiteClaimed("failingsite");
            for (const site of "ABCDEFGHIJ") {
                markSiteClaimed("Site " + site);
            }
        }, 500);

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

            removeFailedSite("failingsite");

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

    function toggleActiveStudy(button: number): void {
        studyState.activeButton[button] = !studyState.activeButton[button];
        setCatalogue(
            filterCatalogue(catalogue as Catalogue, getSelectedStudies()),
        );
    }
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
        <lens-search-button></lens-search-button>
    </div>
    <div id="catalogue-and-grid-wrapper">
        <div id="catalogue" class="card">
            <div class="studien-button-bar">
                <!-- eslint-disable-next-line svelte/require-each-key -->
                {#each studyState.studies as study, index}
                    <button
                        onclick={() => toggleActiveStudy(index)}
                        class="studien-button"
                        class:active={studyState.activeButton[index]}
                    >
                        {#if studyState.activeButton[index]}
                            <Check size={18} />
                        {:else}
                            <X size={18} />
                        {/if}
                        {study}
                    </button>
                {/each}
                <!-- eslint-disable-next-line svelte/require-each-key -->
                <!--{#each studyState.studies as study, index}
                    <span class="studien-checkbox-label">
                        <input
                                part="lens-result-table-header-checkbox"
                                type="checkbox"
                                checked={studyState.activeButton[index]}
                                onchange={() => toggleActive(index)}
                        />
                        <span class="studien-checkbox-label-index"
                              style="background-color: {getCohortParam(study).color}">{index + 1}</span>
                        {study}
                    </span>
                {/each}-->
            </div>
            <lens-catalogue toggle={{ collapsable: false }}></lens-catalogue>
        </div>
        <div id="main-grid">
            <div id="result-summary" class="card">
                <lens-result-summary></lens-result-summary>
                <lens-search-modified-display></lens-search-modified-display>
            </div>
            <div id="result-table" class="card">
                <lens-result-table
                    pageSize={10}
                    showRoundedTo={(value: number) => {
                        if (value < 10) return "Exact value";
                        if (value < 100)
                            return "Rounded to the nearest multiple of 10";
                        return "Rounded to the nearest multiple of 100";
                    }}
                ></lens-result-table>
                <lens-negotiate-button></lens-negotiate-button>
            </div>
            <div class="card">
                <lens-chart
                    title="Gender distribution"
                    dataKey="gender"
                    chartType="pie"
                    displayLegends={true}
                    enableSorting={true}
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
                    enableSorting={true}
                    backgroundColor={barChartBackgroundColors}
                    hoverBackgroundColor={barChartHoverColors}
                ></lens-chart>
            </div>
        </div>
    </div>
    <footer class="card">
        <lens-about></lens-about>
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
        background-color: var(--white);
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

    .studien-button-bar {
        padding: 10px 10px 20px;
        display: flex !important;
        justify-content: space-around;
    }
    .studien-button {
        position: relative;
        width: 100px;
        height: 40px;
        border: 1px solid #dce1e9;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        background: linear-gradient(145deg, #ffffff, #edf0f5);

        color: #536176;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 2px;

        cursor: pointer;
        transform: translateY(-2px);

        box-shadow:
            0 2px 2px #fff inset,
            0 -1px 3px #d8dde6 inset,
            0 4px 0 #c5cbd575,
            0 10px 14px #00000020;
        transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            background 0.16s ease,
            color 0.16s ease;
    }

    .studien-button.active {
        transform: translateY(0);

        background: linear-gradient(145deg, #f0fff9, #d5f5e9);

        color: #078b68;
        border-color: #45c9a0;

        box-shadow:
            0 2px 3px #fff inset,
            0 -2px 4px #bce8d8 inset,
            0 2px 0 #36ad892b,
            0 4px 8px #38c99a66,
            0 0 10px #38c99a55;
    }

    .studien-button:hover {
        filter: brightness(1.02);
    }

    .studien-button:focus-visible {
        outline: 2px solid #159c78;
        outline-offset: 7px;
    }

    .studien-button:active {
        transform: translateY(1px);
    }
    .studien-checkbox-label {
        display: flex;
        align-items: center;
    }
    .studien-checkbox-label-index {
        font-size: x-small;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        margin: 0 5px;
        color: white;
    }
</style>
