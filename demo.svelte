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
        type LensCatalogue,
    } from "./src/index";
    import catalogue from "./demo-catalogue.json";

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

    setCatalogue(catalogue as LensCatalogue);

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
        <lens-domain-summary></lens-domain-summary>
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
</style>
