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

    /**
     * Generate a PDF from the current page.
     *
     * This function captures the content inside the `<div class="main">` element,
     * adds a centered title at the top, and saves the PDF with a filename
     * containing the current date in the format `YYYY-MM-DD`.
     */
    async function generatePDF() {
        const elementName = 'main';
        const element = document.querySelector(elementName); // choose DOM element to print
        if (!element) {
            console.error("Element " + elementName + " not found.");
            return;
        }

        // Capture the current date
        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 10);

        // Generate the canvas
        const canvas = await createCanvasFromElement(element);
        const imgData = canvas.toDataURL('image/png');

        // Initialize PDF document
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Calculate dimensions
        const { pdfWidth, pdfHeight, imgHeight } = calculateDimensions(pdf, imgData);

        // Add a centered title to the PDF
        const contentYStart = addTitleToPDF(pdf, formattedDate);

        // Add the image to the PDF
        addImageToPDF(pdf, imgData, pdfWidth, imgHeight, contentYStart, pdfHeight);

        // Save the PDF with the formatted date in the filename
        pdf.save(`AMRReport-${formattedDate}.pdf`);
    }

    /**
     * Create a canvas from a specified element.
     * @param {HTMLElement} element - The HTML element to render to a canvas.
     * @returns {Promise<HTMLCanvasElement>} The generated canvas.
     */
    function createCanvasFromElement(element: HTMLElement): Promise<HTMLCanvasElement> {
        return html2canvas(element, { useCORS: true });
    }

    /**
     * Calculate dimensions for the PDF and image.
     * @param {jsPDF} pdf - The jsPDF instance.
     * @param {string} imgData - The image data URL.
     * @returns {object} - The calculated dimensions.
     */
    function calculateDimensions(pdf: jsPDF, imgData: string) {
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        return { pdfWidth, pdfHeight, imgHeight };
    }

    /**
     * Add a centered title to the PDF.
     * @param {jsPDF} pdf - The jsPDF instance.
     * @param {string} formattedDate - The formatted date string.
     * @returns {number} - The Y position where the content starts.
     */
    function addTitleToPDF(pdf: jsPDF, formattedDate: string): number {
        const titleText = `AMR Report for ${formattedDate}`;
        const titleMargin = 10;
        const titleFontSize = 14;

        pdf.setFontSize(titleFontSize);
        const textWidth = pdf.getStringUnitWidth(titleText) * pdf.getFontSize() / pdf.internal.scaleFactor;
        const xOffset = (pdf.internal.pageSize.getWidth() - textWidth) / 2;
        pdf.text(titleText, xOffset, titleMargin + titleFontSize / 2);

        return titleMargin + titleFontSize + 5; // Return the Y position for content
    }

    /**
     * Add an image to the PDF document.
     * @param {jsPDF} pdf - The jsPDF instance.
     * @param {string} imgData - The image data URL.
     * @param {number} pdfWidth - The width of the PDF page.
     * @param {number} imgHeight - The height of the image.
     * @param {number} contentYStart - The Y position to start the content.
     * @param {number} pdfHeight - The height of the PDF page.
     */
    function addImageToPDF(pdf: jsPDF, imgData: string, pdfWidth: number, imgHeight: number, contentYStart: number, pdfHeight: number) {
        const totalPages = Math.ceil((imgHeight + contentYStart) / pdfHeight);

        for (let i = 0; i < totalPages; i++) {
            if (i > 0) {
                pdf.addPage();
            }
            pdf.addImage(
                imgData,
                'PNG',
                0,
                contentYStart - i * pdfHeight,
                pdfWidth,
                imgHeight
            );
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
        <button on:click={generatePDF}>Generate Report</button>
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
                        title="Date used for statistics"
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
                        title="Date used for statistics"
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
                        title="Date valid from"
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
                        title="Date valid from"
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
