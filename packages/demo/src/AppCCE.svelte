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
        catalogueUrl = "catalogues/catalogue-cce.json";
        optionsFilePath = "options-cce-prod.json";
    } else {
        catalogueUrl = "catalogues/catalogue-cce.json";
        optionsFilePath = "options-cce-demo.json";
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
            name: "CCE-VDC",
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
            labelFrom: "from",
            labelTo: "to",
        },
    };

    let catalogueopen: boolean = false;

    const genderHeaders: Map<string, string> = new Map<string, string>()
        .set("male", "male")
        .set("female", "female")
        .set("other", "other")
        .set("unknown", "unknown");

    const barChartBackgroundColors: string[] = ["#4dc9f6", "#3da4c7"];

    const vitalStateHeaders: Map<string, string> = new Map<string, string>()
        .set("lebend", "alive")
        .set("verstorben", "deceased")
        .set("unbekannt", "unknown");

    const therapyHeaders: Map<string, string> = new Map<string, string>()
        .set("medicationStatements", "ST")
        .set("ST", "RT");

    let dataPasser: LensDataPasser;
</script>

<header>
    <div class="header-wrapper">
        <div class="logo">
            <img src="../logo-CCE-DKFZ.svg" alt="Logo DKFZ" />
            <img src="../logo-CCE-GR.jpg" alt="Logo GR" />
            <img src="../logo-CCE-KI.svg" alt="Logo KI" />
            <img src="../logo-CCE-VHIO.png" alt="Logo VHIO" />
        </div>
        <h1>Cancer Core Europe - Virtual Data Centre</h1>
        <div class="logo logo-dkfz">
            <img src="../logo-CCE-DKFZ.svg" alt="Logo DKFZ" />
        </div>
    </div>
</header>
<main>
    <div class="search">
        <div class="search-wrapper">
            <lens-search-bar noMatchesFoundMessage={"No results found"} />
            <lens-info-button
                noQueryMessage="Empty search query: Searches for all results."
                showQuery={true}
            />
            <lens-search-button title="Search" />
        </div>
    </div>
    <div class="grid">
        <div class="catalogue-wrapper">
            <div class="catalogue">
                <h2>Suchkriterien</h2>
                <lens-info-button
                    message={[
                        `For patients with several oncological diagnoses, selected search criteria can refer not only to one disease, but also to others.`,
                        `Within a category, different characteristics are searched for with an ‘or link’; when searching across several categories with an ‘and link’.`,
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
                    >Diagrams no longer represent the current search!</lens-search-modified-display
                >
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Patients per site"
                    catalogueGroupCode="patients"
                    perSite={true}
                    displayLegends={true}
                    chartType="pie"
                />
            </div>
            <div class="chart-wrapper result-table">
                <lens-result-table pageSize="10">
                    <div slot="above-pagination" class="result-table-hint-text">
                        * The number of possible FFPE samples available from the
                        pathology pathology is based on the number of
                        histological histologies.
                    </div>
                </lens-result-table>
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Sex"
                    catalogueGroupCode="gender"
                    chartType="pie"
                    displayLegends={true}
                    headers={genderHeaders}
                />
            </div>
            <div class="chart-wrapper chart-diagnosis">
                <lens-chart
                    title="Diagnosis"
                    catalogueGroupCode="diagnosis"
                    chartType="bar"
                    indexAxis="y"
                    groupingDivider="."
                    groupingLabel=".%"
                    filterRegex="^[CD].*"
                    xAxisTitle="Number of diagnoses"
                    yAxisTitle="ICD-10-Codes"
                    backgroundColor={barChartBackgroundColors}
                />
            </div>
            <div class="chart-wrapper chart-age-distribution">
                <lens-chart
                    title="Age at diagnosis"
                    catalogueGroupCode="age_at_diagnosis"
                    chartType="bar"
                    groupRange={10}
                    filterRegex="^(([0-9]?[0-9]$)|(1[0-2]0))"
                    xAxisTitle="Age"
                    yAxisTitle="Number of primary diagnoses"
                    backgroundColor={barChartBackgroundColors}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Vital status"
                    catalogueGroupCode="75186-7"
                    chartType="pie"
                    displayLegends={true}
                    headers={vitalStateHeaders}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Therapy type"
                    catalogueGroupCode="therapy_of_tumor"
                    chartType="bar"
                    headers={therapyHeaders}
                    xAxisTitle="Type of therapy"
                    yAxisTitle="Number of therapies"
                    backgroundColor={barChartBackgroundColors}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Systemic therapies"
                    catalogueGroupCode="medicationStatements"
                    chartType="bar"
                    xAxisTitle="Type of therapy"
                    yAxisTitle="Number of therapiese"
                    backgroundColor={barChartBackgroundColors}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Specimen"
                    catalogueGroupCode="sample_kind"
                    chartType="bar"
                    xAxisTitle="Specimen type"
                    yAxisTitle="Number of specimen"
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
    <a class="email" href="mailto:CCP@dkfz.de"> Kontakt </a>
</footer>

{#await jsonPromises}
    Loading data...
{:then { optionsJSON, catalogueJSON }}
    <lens-options {catalogueJSON} {optionsJSON} {measures}></lens-options>
{:catch someError}
    System error: {someError.message}
{/await}

<lens-data-passer bind:this={dataPasser} />
