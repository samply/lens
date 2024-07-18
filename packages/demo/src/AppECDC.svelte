<script lang="ts">
    import "../../lib";
    import type { CatalogueText } from "../../lib/src/types/texts";
    import {
        ehds2PatientMeasure,
        ehds2ObservationMeasure,
        ehds2SpecimenMeasure,
    } from "./measures";
    import html2canvas from "html2canvas";
    import jsPDF from "jspdf";

    let mockCatalogueData = "";
    let libraryOptions = "";

    fetch("catalogues/catalogue-ecdc.json")
        .then((response) => response.text())
        .then((data) => {
            mockCatalogueData = data;
        });

    fetch("ecdc_options.json")
        .then((response) => response.json())
        .then((data) => {
            libraryOptions = data;
        });

    const measures = [
        ehds2PatientMeasure,
        ehds2ObservationMeasure,
        ehds2SpecimenMeasure,
    ];

    const backendMeasures = `EHDS2_IN_INITIAL_POPULATION`;

    const catalogueText: CatalogueText = {
        group: "Group",
        collapseButtonTitle: "Collapse Tree",
        expandButtonTitle: "Expand Tree",
        numberInput: {
            labelFrom: "from",
            labelTo: "to",
        },
    };

    let catalogueopen = false;

    const catalogueKeyToResponseKeyMap = [
        ["gender", "Gender"],
        ["age_class", "AgeClass"],
        ["hospital_unit_type", "HospitalUnitType"],
        ["hospital_id", "HospitalId"],
        ["laboratory_code", "LaboratoryCode"],
        ["pathogen_code", "PathogenCode"],
        ["antibiotic_code", "AntibioticCode"],
        ["sir_code", "SirCode"],
        ["data_source", "DataSource"],
        ["isolate_id", "SpecimenIsolateId"], // From Specimen
        ["patient_type", "PatientType"],
        ["reference_guidelines_sir", "ReferenceGuidelinesSir"],
        ["reporting_country", "ReportingCountry"],
        ["date_valid_from", "DateValidFrom"],
        ["date_used_for_statistics", "DateUsedForStatistics"],
        ["year_date_used_for_statistics", "YearDateUsedForStatistics"],
        ["year_month_date_used_for_statistics", "YearMonthDateUsedForStatistics"],
        ["year_date_valid_from", "YearDateValidFrom"],
        ["year_month_date_valid_from", "YearMonthDateValidFrom"],
    ];

    // VITE_TARGET_ENVIRONMENT should be set by the ci pipeline
    const backendUrl =
        import.meta.env.VITE_TARGET_ENVIRONMENT === "production"
            ? "http://lens/"
            : "http://lens/";
    const uiSiteMap: string[][] = [
        ["ecdc-bridgehead-test1", "Heidelberg-DKFZ"],
    ];

    const backendConfig = {
        url: import.meta.env.PROD ? backendUrl : "http://lens",
        backends: ["ecdc-bridgehead-test1"],
        uiSiteMap: uiSiteMap,
        catalogueKeyToResponseKeyMap: catalogueKeyToResponseKeyMap,
    };

    const barChartBackgroundColors: string[] = ["#4dc9f6", "#3da4c7"];

    async function generatePDF() {
        const element = document.querySelector('main');
        if (element) {
            const canvas = await html2canvas(element, { useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            const totalPages = Math.ceil(pdfHeight / pdf.internal.pageSize.getHeight());

            for (let i = 0; i < totalPages; i++) {
                if (i > 0) {
                    pdf.addPage();
                }
                pdf.addImage(
                    imgData,
                    'PNG',
                    0,
                    -i * pdf.internal.pageSize.getHeight(),
                    pdfWidth,
                    pdfHeight
                );
            }

            pdf.save('document.pdf');
        }
    }
</script>

<header>
    <div class="logo">
        <img src="../ECDC_logo.svg.png" alt="Logo of ECDC" />
    </div>
    <h1>AMR Explorer</h1>
    <div class="logo logo-dkfz">
        <img
            src="../Deutsches_Krebsforschungszentrum_Logo.svg"
            alt="Logo of the DKFZ"
        />
    </div>
</header>
<main>
    <div class="search">
        <lens-search-bar
            treeData={mockCatalogueData}
            noMatchesFoundMessage={"no results found"}
        />
        <lens-search-button
            title="Search"
            {measures}
            backendConfig={JSON.stringify(backendConfig)}
            {backendMeasures}
        />
        <button on:click={generatePDF}>Download/PDF</button>
    </div>
    <div class="grid">
        <div class="catalogue">
            <h2>Search Tree</h2>
            <lens-catalogue
                toggleIconUrl="right-arrow-svgrepo-com.svg"
                addIconUrl="long-right-arrow-svgrepo-com.svg"
                infoIconUrl="info-circle-svgrepo-com.svg"
                treeData={mockCatalogueData}
                texts={catalogueText}
                toggle={{ collapsable: false, open: catalogueopen }}
            />
        </div>
        <div class="charts">
            <div class="chart-wrapper result-table">
                <lens-result-table> </lens-result-table>
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Gender"
                    catalogueGroupCode="gender"
                    chartType="bar"
                    xAxisTitle="Gender signifier"
                    yAxisTitle="Number of patients"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Age"
                    catalogueGroupCode="age_class"
                    chartType="bar"
                    xAxisTitle="Age ranges"
                    yAxisTitle="Number of patients"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper chart-double-width">
                <lens-chart
                    title="Hospital ID"
                    catalogueGroupCode="hospital_id"
                    chartType="bar"
                    xAxisTitle="ID"
                    yAxisTitle="Number of patients"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper chart-double-width">
                <lens-chart
                    title="Laboratory code"
                    catalogueGroupCode="laboratory_code"
                    chartType="bar"
                    xAxisTitle="Code"
                    yAxisTitle="Number of patients"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Hospital Unit Type"
                    catalogueGroupCode="hospital_unit_type"
                    chartType="bar"
                    xAxisTitle="Unit type"
                    yAxisTitle="Number of patients"
                    backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Pathogen Code"
                    catalogueGroupCode="pathogen_code"
                    chartType="bar"
                    xAxisTitle="Code"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper chart-double-width">
                <lens-chart
                    title="Antibiotic Code"
                    catalogueGroupCode="antibiotic_code"
                    chartType="bar"
                    xAxisTitle="Code"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="SIR Code"
                    catalogueGroupCode="sir_code"
                    chartType="bar"
                    xAxisTitle="Code"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Data source"
                    catalogueGroupCode="data_source"
                    chartType="bar"
                    xAxisTitle="Code"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper chart-quadruple-width">
                <lens-chart
                    title="Isolate ID"
                    catalogueGroupCode="isolate_id"
                    chartType="bar"
                    xAxisTitle="ID"
                    yAxisTitle="Number of isolates"
                    backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Patient type"
                    catalogueGroupCode="patient_type"
                    chartType="bar"
                    xAxisTitle="Type"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Reference guidelines SIR"
                    catalogueGroupCode="reference_guidelines_sir"
                    chartType="bar"
                    xAxisTitle="Guidelines"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Reporting country"
                    catalogueGroupCode="reporting_country"
                    chartType="bar"
                    xAxisTitle="Country"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                        title="Date used for statistics (year)"
                        catalogueGroupCode="year_date_used_for_statistics"
                        chartType="bar"
                        xAxisTitle="Year"
                        yAxisTitle="Number of observations"
                        backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                        title="Date used for statistics (year-month)"
                        catalogueGroupCode="year_month_date_used_for_statistics"
                        chartType="bar"
                        xAxisTitle="Year-Month"
                        yAxisTitle="Number of observations"
                        backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                        title="Date valid from (year)"
                        catalogueGroupCode="year_date_valid_from"
                        chartType="bar"
                        xAxisTitle="Year"
                        yAxisTitle="Number of observations"
                        backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                        title="Date valid from (year-month)"
                        catalogueGroupCode="year_month_date_valid_from"
                        chartType="bar"
                        xAxisTitle="Year-Month"
                        yAxisTitle="Number of observations"
                        backgroundColor={JSON.stringify(
                        barChartBackgroundColors,
                    )}
                />
            </div>
        </div>
    </div>
</main>

<lens-options options={libraryOptions} catalogueData={mockCatalogueData} />
