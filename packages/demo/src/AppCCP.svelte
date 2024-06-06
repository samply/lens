<script lang="ts">
    import type { MeasureItem, QueryEvent } from "../../../dist/types";

    import {
        dktkDiagnosisMeasure,
        dktkMedicationStatementsMeasure,
        dktkPatientsMeasure,
        dktkProceduresMeasure,
        dktkSpecimenMeasure,
        dktkHistologyMeasure,
    } from "./measures";

    import { buildLibrary } from "./backends/cql-measure";
    import { translateAstToCql } from "./backends/ast-to-cql-translator";
    import { buildMeasure } from "./backends/cql-measure";
    import { Spot } from "./backends/spot";

    let catalogueData = "";
    let libraryOptions = "";

    fetch("catalogues/catalogue-dktk.json")
        .then((response) => response.text())
        .then((data) => {
            catalogueData = data;
        });

    fetch("options.json")
        .then((response) => response.json())
        .then((data) => {
            libraryOptions = data;
        });

    const measures = [
        {
            name: "DKTK",
            measures: [
                dktkPatientsMeasure,
                dktkDiagnosisMeasure,
                dktkSpecimenMeasure,
                dktkProceduresMeasure,
                dktkMedicationStatementsMeasure,
                dktkHistologyMeasure,
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

    // // VITE_TARGET_ENVIRONMENT should be set by the ci pipeline
    // const backendUrl =
    //     import.meta.env.VITE_TARGET_ENVIRONMENT === "production"
    //         ? "https://backend.data.dktk.dkfz.de/prod/"
    //         : "https://backend.demo.lens.samply.de/prod/";

    const genderHeaders: Map<string, string> = new Map<string, string>()
        .set("male", "männlich")
        .set("female", "weiblich")
        .set("other", "Divers")
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

    import type { LensDataPasser } from "../../lib/src/types/DataPasser";
    let dataPasser: LensDataPasser;

    window.addEventListener("emit-lens-query", (e) => {
        const event = e as QueryEvent;
        const { ast, updateResponse, abortController } = event.detail;

        const measureItems = [
            dktkPatientsMeasure,
            dktkDiagnosisMeasure,
            dktkSpecimenMeasure,
            dktkProceduresMeasure,
            dktkMedicationStatementsMeasure,
            dktkHistologyMeasure,
        ] as MeasureItem[];

        const criteria = dataPasser.getCriteriaAPI("diagnosis");

        const cql = translateAstToCql(
            ast,
            false,
            "DKTK_STRAT_DEF_IN_INITIAL_POPULATION",
            measureItems,
            criteria,
        );

        const library = buildLibrary(`${cql}`);
        const measure = buildMeasure(library.url, measures);
        const query = { lang: "cql", lib: library, measure: measure };

        const backend = new Spot(new URL("http://localhost:8080"), [
            "berlin",
            "berlin-test",
            "bonn",
            "dresden",
            "essen",
            "frankfurt",
            "freiburg",
            "hannover",
            "mainz",
            "muenchen-lmu",
            "muenchen-tum",
            "ulm",
            "wuerzburg",
            "mannheim",
            "dktk-test",
            "hamburg",
        ]);

        backend.send(
            btoa(decodeURI(JSON.stringify(query))),
            updateResponse,
            abortController,
        );
    });
</script>

<header>
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
</header>
<main>
    <div class="search">
        <lens-search-bar
            treeData={catalogueData}
            noMatchesFoundMessage={"keine Ergebnisse gefunden"}
        />
        <lens-info-button
            noQueryMessage="Leere Suchanfrage: Sucht nach allen Ergebnissen."
            showQuery={true}
        />
        <lens-search-button title="Suchen" />
    </div>
    <div class="grid">
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
                addIconUrl="long-right-arrow-svgrepo-com.svg"
                infoIconUrl="info-circle-svgrepo-com.svg"
                treeData={catalogueData}
                texts={catalogueText}
                toggle={{ collapsable: false, open: catalogueopen }}
            />
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
                    yAxisTitle="Anzahl der Therapien"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Systemische Therapien"
                    catalogueGroupCode="medicationStatements"
                    chartType="bar"
                    xAxisTitle="Art der Therapie"
                    yAxisTitle="Anzahl der Therapien"
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
