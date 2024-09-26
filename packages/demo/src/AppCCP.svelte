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

    /**
     * VITE_TARGET_ENVIRONMENT is set by the ci pipeline
     */

    let catalogueUrl: string = "";
    let optionsFilePath: string = "";

    if (import.meta.env.VITE_TARGET_ENVIRONMENT === "production") {
        catalogueUrl = "catalogues/catalogue-dktk.json";
        optionsFilePath = "options-ccp-prod.json";
    } else {
        catalogueUrl = "catalogues/catalogue-dktk-staging.json";
        optionsFilePath = "options-ccp-demo.json";
    }

    /**
     * fetch both catalogue data and options
     * response needs to be converted to text so that it can be passed to the options component for proper schema validation
     * @param catalogueUrl the url where to fetch the catalogue.json
     * @param optionsFilePath the url where to fetch the options.json
     * @returns a promise that resolves to an object containing the catalogueJSON and optionsJSON
     */
    const fetchData = async (
        catalogueUrl: string,
        optionsFilePath: string,
    ): Promise<{ catalogueJSON: string; optionsJSON: string }> => {
        const cataloguePromise: string = await fetch(catalogueUrl).then(
            (response) => response.text(),
        );

        const optionsPromise: string = await fetch(optionsFilePath).then(
            (response) => response.text(),
        );

        return Promise.all([cataloguePromise, optionsPromise]).then(
            ([catalogueJSON, optionsJSON]) => {
                return { catalogueJSON, optionsJSON };
            },
        );
    };

    const jsonPromises: Promise<{
        catalogueJSON: string;
        optionsJSON: string;
    }> = fetchData(catalogueUrl, optionsFilePath);

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
     * TODO: add catalogueText option to config file
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

    let catalogueopen: boolean = false;

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
                <!-- TODO: comment in when backend is ready -->
                <!-- <lens-negotiate-button /> -->
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
                        * Die Anzahl der möglichen vorhandenen FFPE-Proben aus
                        der Pathologie beruht auf der Menge der gezählten
                        Histologien.
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
                    backgroundColor={barChartBackgroundColors}
                />
            </div>
            <div class="chart-wrapper chart-age-distribution">
                <lens-chart
                    title="Alter bei Erstdiagnose"
                    catalogueGroupCode="age_at_diagnosis"
                    chartType="bar"
                    groupRange={10}
                    filterRegex="^(([0-9]?[0-9]$)|(1[0-2]0))"
                    xAxisTitle="Alter"
                    yAxisTitle="Anzahl der Primärdiagnosen"
                    backgroundColor={barChartBackgroundColors}
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
                    backgroundColor={barChartBackgroundColors}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Systemische Therapien"
                    catalogueGroupCode="medicationStatements"
                    chartType="bar"
                    xAxisTitle="Art der Therapie"
                    yAxisTitle="Anzahl der Therapieeinträge"
                    backgroundColor={barChartBackgroundColors}
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
                    backgroundColor={barChartBackgroundColors}
                >
                </lens-chart>
            </div>
        </div>
    </div>
</main>

<footer>
    <a
        class="known-issues"
        href="https://hub.dkfz.de/s/iP6A7zJzAQya3iC"
        target="_blank"
    >
        Known Issues
    </a>
    <a
        href="https://dktk.dkfz.de/forschung/Plattformen-und-Technologie-Netzwerke/klinische-plattformen/ccp-faq"
        class="faq"
        target="_blank">FAQ</a
    >
    <a class="ccp" href="https://dktk.dkfz.de/ccp" target="_blank">
        Clinical Communication Platform (CCP)
    </a>
    <a class="email" href="mailto:CCP@dkfz.de">Kontakt</a>
    <a
        class="user-agreement"
        href="https://hub.dkfz.de/s/MPCg2kK23LH8Yii"
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

{#await jsonPromises}
    Loading data...
{:then { optionsJSON, catalogueJSON }}
    <lens-options {catalogueJSON} {optionsJSON} {measures}></lens-options>
{:catch someError}
    System error: {someError.message}
{/await}

<lens-data-passer bind:this={dataPasser} />
