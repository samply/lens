<script lang="ts">
    import type {
        MeasureGroup,
        MeasureItem,
        LensDataPasser,
    } from "../../../dist/types";
    import {
        ehds2PatientMeasure,
        ehds2ObservationMeasure,
        ehds2SpecimenMeasure,
    } from "./measures";
    import html2canvas from "html2canvas";
    import jsPDF from "jspdf";

    let catalogueData = "";
    let libraryOptions = "";

    fetch("catalogues/catalogue-ecdc.json")
        .then((response) => response.text())
        .then((data) => {
            catalogueData = data;
        });

    // VITE_TARGET_ENVIRONMENT should be set by the ci pipeline
    let optionsFilePath: string = "options-ecdc-prod.json";

    if (import.meta.env.VITE_TARGET_ENVIRONMENT === "production") {
        optionsFilePath = "options-ecdc-prod.json";
    } else if (import.meta.env.VITE_TARGET_ENVIRONMENT === "staging") {
        optionsFilePath = "options-ecdc-prod.json";
    }

    fetch(optionsFilePath)
        .then((response) => response.json())
        .then((data) => {
            libraryOptions = data;
        });

    const measures: MeasureGroup[] = [
        {
            name: "ECDC",
            measures: [
                ehds2PatientMeasure as MeasureItem,
                ehds2ObservationMeasure as MeasureItem,
                ehds2SpecimenMeasure as MeasureItem,
            ],
        },
    ];

    const catalogueText = {
        group: "Group",
        collapseButtonTitle: "Collapse Tree",
        expandButtonTitle: "Expand Tree",
        numberInput: {
            labelFrom: "from",
            labelTo: "to",
        },
    };

    let catalogueopen = false;

    const barChartBackgroundColors: string[] = ["#4dc9f6", "#3da4c7"];

    let dataPasser: LensDataPasser;

    /**
     * Generate a PDF from the current page.
     *
     * This function captures the content inside selected elements of the DOM,
     * adds a centered title at the top, and saves the PDF with a filename
     * containing the current date in the format `YYYY-MM-DD`.
     */
    async function generatePDF() {
        // Capture the current date
        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 10);

        // Initialize PDF document
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Add a centered title to the PDF
        let contentYStart = addTitleToPDF(pdf, formattedDate);

        // Add selected elements from DOM to PDF
        if (isSearchBarFilled()) {
            // Only add search bar if it contains something.
            contentYStart = await addElementToPDF(pdf, 'lens-search-bar', contentYStart);
        }
        await addElementToPDF(pdf, '.charts', contentYStart);

        // Save the PDF to file
        pdf.save(`AMRReport-${formattedDate}.pdf`);
    }

    /**
     * Checks if the search bar is filled by determining whether any elements
     * with the part attribute 'lens-searchbar-chips' exist within the shadow
     * root of the 'lens-search-bar' element.
     *
     * @returns {boolean} - Returns true if elements with 'lens-searchbar-chips'
     *                      are found within the shadow root, indicating that the
     *                      search bar is filled; otherwise, returns false.
     *
     */
    // N.B. this isn't a nice way to do things, because it means knowing the structure of
    // the lens search bar shadow DOM.
    function isSearchBarFilled() {
        // Get the shadow host element
        const shadowHost = document.querySelector('lens-search-bar');

        // Access the shadow root (assuming it's open)
        const shadowRoot = shadowHost ? shadowHost.shadowRoot : null;

        // Check if the shadow root is available
        if (shadowRoot) {
            const chips = shadowRoot.querySelector('div[part="lens-searchbar-chips"]')
            // Query inside the shadow root
            return chips != null;
        }

        return false;
    }

    /**
     * Add an element to the PDF document at a given Y position.
     * @param pdf
     * @param elementName
     * @param contentYStart
     * @returns new contentYStart
     */
    async function addElementToPDF(pdf: jsPDF, elementName: string, contentYStart: number) {
        const element = document.querySelector(elementName); // choose DOM element to print
        if (!element) {
            console.error("Element " + elementName + " not found.");
            return;
        }

        // Generate the canvas
        const canvas = await createCanvasFromElement(element);
        const imgData = canvas.toDataURL('image/png');

        // Calculate dimensions
        const { pdfWidth, pdfHeight, imgHeight } = calculateDimensions(pdf, imgData);

        // Add the image to the PDF
        addImageToPDF(pdf, imgData, pdfWidth, imgHeight, contentYStart, pdfHeight);

        return contentYStart + imgHeight;
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
    <div class="header-wrapper">
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
    </div>
</header>
<main>
    <div class="search">
        <div class="search-wrapper">
            <lens-search-bar
                noMatchesFoundMessage={"no results found"}
            />
            <lens-search-button title="Search" />
            <button on:click={generatePDF}>Generate Report</button>
        </div>
    </div>

    <div class="grid">
        <div class="catalogue-wrapper">
            <div class="catalogue">
                <h2>Search Tree</h2>
                <lens-catalogue
                    toggleIconUrl="right-arrow-svgrepo-com.svg"
                    texts={catalogueText}
                    toggle={{ collapsable: false, open: catalogueopen }}
                    addIconUrl="long-right-arrow-svgrepo-com.svg"
                />
            </div>
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
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Pathogen Code"
                    catalogueGroupCode="pathogen_code"
                    chartType="bar"
                    xAxisTitle="Code"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper chart-double-width">
                <lens-chart
                    title="Antibiotic Code"
                    catalogueGroupCode="antibiotic_code"
                    chartType="bar"
                    xAxisTitle="Code"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="SIR Code"
                    catalogueGroupCode="sir_code"
                    chartType="bar"
                    xAxisTitle="Code"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Data source"
                    catalogueGroupCode="data_source"
                    chartType="bar"
                    xAxisTitle="Code"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper chart-quadruple-width">
                <lens-chart
                    title="Isolate ID"
                    catalogueGroupCode="isolate_id"
                    chartType="bar"
                    xAxisTitle="ID"
                    yAxisTitle="Number of isolates"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Patient type"
                    catalogueGroupCode="patient_type"
                    chartType="bar"
                    xAxisTitle="Type"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Reference guidelines SIR"
                    catalogueGroupCode="reference_guidelines_sir"
                    chartType="bar"
                    xAxisTitle="Guidelines"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                    title="Reporting country"
                    catalogueGroupCode="reporting_country"
                    chartType="bar"
                    xAxisTitle="Country"
                    yAxisTitle="Number of observations"
                    backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                        title="Date used for statistics"
                        catalogueGroupCode="year_date_used_for_statistics"
                        chartType="bar"
                        xAxisTitle="Year"
                        yAxisTitle="Number of observations"
                        backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                        title="Date used for statistics"
                        catalogueGroupCode="year_month_date_used_for_statistics"
                        chartType="bar"
                        xAxisTitle="Year-Month"
                        yAxisTitle="Number of observations"
                        backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                        title="Date valid from"
                        catalogueGroupCode="year_date_valid_from"
                        chartType="bar"
                        xAxisTitle="Year"
                        yAxisTitle="Number of observations"
                        backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
            <div class="chart-wrapper">
                <lens-chart
                        title="Date valid from"
                        catalogueGroupCode="year_month_date_valid_from"
                        chartType="bar"
                        xAxisTitle="Year-Month"
                        yAxisTitle="Number of observations"
                        backgroundColor={JSON.stringify(barChartBackgroundColors)}
                />
            </div>
        </div>
    </div>
</main>

<lens-options options={libraryOptions} {catalogueData} {measures} />
<lens-data-passer bind:this={dataPasser} />
