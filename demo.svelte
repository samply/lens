<script lang="ts">
    import {
        setCatalogue,
        setOptions,
        translate,
        setSiteResult,
        getAst,
        showToast,
        markSiteClaimed,
        setFacetCounts,
        clearSiteResults,
        getHumanReadableQueryAsFormattedString,
        type LensCatalogue,
    } from "./src/index";
    import catalogue from "./demo-catalogue.json";
    import demoResults from "./demo-results.json";

    type DemoSiteResult = {
        id: string;
        name: string;
        domains: string[];
        totals: {
            patients: number;
            samples: number;
        };
        stratifiers: {
            gender: Record<string, number>;
            age_bucket: Record<string, number>;
            diagnosis_icd10: Record<string, number>;
            procedure_category: Record<string, number>;
        };
    };

    type DemoResults = {
        sites: DemoSiteResult[];
    };

    const results = demoResults as DemoResults;
    const siteMappings = Object.fromEntries(
        results.sites.map((site) => [site.id, site.name]),
    );

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
        siteMappings,
        chartOptions: {
            gender: {
                legendMapping: {
                    male: "Male",
                    female: "Female",
                    other: "Other",
                },
            },
        },
        tableOptions: {
            headerData: [
                {
                    title: "Sites",
                    dataKey: "site",
                },
                {
                    title: "Patients",
                    dataKey: "patients",
                },
                {
                    title: "Samples",
                    dataKey: "samples",
                },
            ],
        },
        resultSummaryOptions: {
            title: "Results",
            infoButtonText:
                "Demo notice: results are static for demonstration purposes and do not reflect the active query.",
            dataTypes: [
                {
                    title: "Sites",
                    dataKey: "collections",
                },
                {
                    title: "Patients",
                    dataKey: "patients",
                },
            ],
        },
    });

    setCatalogue(catalogue as LensCatalogue);

    setFacetCounts({
        diagnosis_icd10: {
            C34: 254,
            C50: 132,
            C18: 70,
            C61: 41,
            C25: 20,
        },
        procedure_category: {
            surgery: 167,
            "systemic-therapy": 175,
            radiotherapy: 93,
            "diagnostic-procedure": 59,
            other: 23,
        },
    });

    window.addEventListener("lens-search-triggered", () => {
        console.log("AST:", JSON.stringify(getAst()));
        clearSiteResults();

        setTimeout(() => {
            for (const site of results.sites) {
                markSiteClaimed(site.id);
            }
        }, 500);

        setTimeout(() => {
            for (const site of results.sites) {
                setSiteResult(site.id, {
                    totals: site.totals,
                    stratifiers: site.stratifiers,
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
            getHumanReadableQueryAsFormattedString(),
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
        <!-- <lens-query-explain-button></lens-query-explain-button> -->
        <lens-search-button></lens-search-button>
    </div>
    <lens-domain-summary></lens-domain-summary>
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
                <lens-result-table
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
                    title="Age distribution"
                    dataKey="age_bucket"
                    chartType="bar"
                    xAxisTitle="Age bucket"
                    yAxisTitle="Patients"
                ></lens-chart>
            </div>
            <div class="card">
                <lens-chart
                    title="ICD-10-GM diagnoses"
                    dataKey="diagnosis_icd10"
                    chartType="bar"
                    indexAxis="y"
                    scaleType="logarithmic"
                    xAxisTitle="Cases"
                    yAxisTitle="ICD-10 code"
                    enableSorting={true}
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
</style>
