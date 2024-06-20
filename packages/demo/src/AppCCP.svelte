<script lang="ts">
    import type {
        MeasureGroup,
        MeasureItem,
        LensDataPasser,
    } from "../../../dist/types";
    import {
        dktkDiagnosisMeasure,
        dktkMedicationStatementsMeasure,
        dktkPatientsMeasure,
        dktkProceduresMeasure,
        dktkSpecimenMeasure,
        dktkHistologyMeasure,
    } from "./measures";

    let catalogueData = "";
    let libraryOptions = "";

    fetch("catalogues/catalogue-dktk.json")
        .then((response) => response.text())
        .then((data) => {
            catalogueData = data;
        });

    // VITE_TARGET_ENVIRONMENT should be set by the ci pipeline
    let optionsFilePath: string = "options-dev.json";

    if (import.meta.env.VITE_TARGET_ENVIRONMENT === "production") {
        optionsFilePath = "options-ccp-prod.json";
    } else if (import.meta.env.VITE_TARGET_ENVIRONMENT === "staging") {
        optionsFilePath = "options-ccp-demo.json";
    }

    fetch(optionsFilePath)
        .then((response) => response.json())
        .then((data) => {
            libraryOptions = data;
        });

    const measures: MeasureGroup[] = [
        {
            name: "DKTK",
            measures: [
                dktkPatientsMeasure as MeasureItem,
                dktkDiagnosisMeasure as MeasureItem,
                dktkSpecimenMeasure as MeasureItem,
                dktkProceduresMeasure as MeasureItem,
                dktkMedicationStatementsMeasure as MeasureItem,
                dktkHistologyMeasure as MeasureItem,
            ],
        },
    ];

    /**
     * move to config file
     */
    const catalogueText = {
        group: "Group",
        collapseButtonTitle: "Collapse Tree",
        expandButtonTitle: "Expand Tree",
        numberInput: {
            labelFrom: "von",
            labelTo: "bis",
        },
    };

    let catalogueopen = false;

    const genderHeaders: Map<string, string> = new Map<string, string>()
        .set("male", "männlich")
        .set("female", "weiblich")
        .set("other", "divers")
        .set("unknown", "unbekannt");

    const barChartBackgroundColors: string[] = ["#4dc9f6", "#3da4c7"];

    const vitalStateHeaders: Map<string, string> = new Map<string, string>()
        .set("lebend", "alive")
        .set("verstorben", "deceased")
        .set("unbekannt", "unknown");

    const therapyHeaders: Map<string, string> = new Map<string, string>().set(
        "medicationStatements",
        "Sys. T",
    );

    let dataPasser: LensDataPasser;
</script>

<header>
    <div class="header-wrapper">
        <div class="logo">
            <img src="../dktk.svg" alt="Logo des DKTK" />
        </div>
        <h1>CCP Explorer</h1>
        <div class="logo logo-dkfz">
            <img
                src="../Deutsches_Krebsforschungszentrum_Logo.svg"
                alt="Logo des DKTK"
            />
        </div>
    </div>
</header>
<main>
    <div class="search">
        <div class="search-wrapper">
            <lens-search-bar
                noMatchesFoundMessage={"keine Ergebnisse gefunden"}
            />
            <lens-info-button
                noQueryMessage="Leere Suchanfrage: Sucht nach allen Ergebnissen."
                showQuery={true}
            />
            <lens-search-button title="Suchen" />
        </div>
    </div>

    <div class="grid">
        <div class="catalogue-wrapper">
            <div class="catalogue">
                <h2>Suchkriterien</h2>
                <lens-info-button
                    message={[
                        `Bei Patienten mit mehreren onkologischen Diagnosen, können sich ausgewählte Suchkriterien nicht nur auf eine Erkrankung beziehen, sondern auch auf Weitere.`,
                        `Innerhalb einer Kategorie werden verschiedene Ausprägungen mit einer „Oder-Verknüpfung“ gesucht; bei der Suche über mehrere Kategorien mit einer „Und-Verknüpfung“.`,
                    ]}
                />
                <lens-catalogue
                    toggleIconUrl="right-arrow-svgrepo-com.svg"
                    texts={catalogueText}
                    toggle={{ collapsable: false, open: catalogueopen }}
                    addIconUrl="long-right-arrow-svgrepo-com.svg"
                />
            </div>
        </div>
        <div class="charts">
            <div class="chart-wrapper result-summary">
                <lens-result-summary />
                <lens-search-modified-display
                    >Diagramme repräsentieren nicht mehr die aktuelle Suche!</lens-search-modified-display
                >
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Patienten pro Standort"
                    catalogueGroupCode="patients"
                    perSite={true}
                    displayLegends={true}
                    chartType="pie"
                />
            </div>
            <div class="chart-wrapper result-table">
                <lens-result-table pageSize="10">
                    <div slot="above-pagination" class="result-table-hint-text">
                        * Umfasst Gewebe- und flüssige Proben. Die Anzahl der
                        FFPE-Proben (Schätzung) entspricht der Zahl der
                        Diagnosen.
                    </div>
                </lens-result-table>
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Geschlecht"
                    catalogueGroupCode="gender"
                    chartType="pie"
                    displayLegends={true}
                    headers={genderHeaders}
                />
            </div>
            <div class="chart-wrapper chart-diagnosis">
                <lens-chart
                    title="Diagnose"
                    catalogueGroupCode="diagnosis"
                    chartType="bar"
                    indexAxis="y"
                    groupingDivider="."
                    groupingLabel=".%"
                    filterRegex="^[CD].*"
                    xAxisTitle="Anzahl der Diagnosen"
                    yAxisTitle="ICD-10-Codes"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper chart-age-distribution">
                <lens-chart
                    title="Alter bei Erstdiagnose"
                    catalogueGroupCode="age_at_diagnosis"
                    chartType="bar"
                    groupRange={10}
                    filterRegex="^(1*[12]*[0-9])"
                    xAxisTitle="Alter"
                    yAxisTitle="Anzahl der Primärdiagnosen"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Vitalstatus"
                    catalogueGroupCode="75186-7"
                    chartType="pie"
                    displayLegends={true}
                    headers={vitalStateHeaders}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Therapieart"
                    catalogueGroupCode="therapy_of_tumor"
                    chartType="bar"
                    headers={therapyHeaders}
                    xAxisTitle="Art der Therapie"
                    yAxisTitle="Anzahl der Therapieeinträge"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Systemische Therapien"
                    catalogueGroupCode="medicationStatements"
                    chartType="bar"
                    xAxisTitle="Art der Therapie"
                    yAxisTitle="Anzahl der Therapieeinträge"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Proben"
                    catalogueGroupCode="sample_kind"
                    chartType="bar"
                    xAxisTitle="Probentypen"
                    yAxisTitle="Probenanzahl"
                    filterRegex="^(?!(tissue-other|buffy-coat|peripheral-blood-cells|dried-whole-blood|swab|ascites|stool-faeces|saliva|liquid-other|derivative-other))"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                >
                </lens-chart>
            </div>
        </div>
    </div>
</main>

<footer>
    <a
        class="ccp"
        href="https://dktk.dkfz.de/klinische-plattformen/ueber-die-ccp/about-ccp"
        target="_blank"
    >
        Clinical Communication Platform (CCP)
    </a>
    <a class="email" href="mailto:CCP@dkfz.de">Kontakt</a>
    <a
        class="user-agreement"
        href="https://hub.dkfz.de/s/xcGZHda8LHd6yGS"
        download="nutzervereinbarung"
        target="_blank">Nutzungsvereinbarung</a
    >
    <a
        class="privacy-policy"
        href="https://hub.dkfz.de/s/M8Ldxd5GsfrQG9S"
        download="datenschutzerklaerung"
        target="_blank">Datenschutz</a
    >
    <a
        class="imprint"
        href="https://www.dkfz.de/de/impressum.html"
        target="_blank">Impressum</a
    >
</footer>

<lens-options options={libraryOptions} {catalogueData} {measures} />
<lens-data-passer bind:this={dataPasser} />
