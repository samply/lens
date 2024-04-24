<script lang="ts">
  import "../../lib";
  import type { CatalogueText } from "../../lib/src/types/texts";
  import {
    ehds2PatientMeasure,
    ehds2ObservationMeasure,
  } from "./measures";

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
    ["isolate_id", "IsolateId"],
    ["patient_type", "PatientType"],
    ["reference_guidelines_sir", "ReferenceGuidelinesSir"],
    ["reporting_country", "ReportingCountry"],
    ["date_valid_from", "DateValidFrom"],
    ["date_used_for_statistics", "DateUsedForStatistics"]
  ];

  // VITE_TARGET_ENVIRONMENT should be set by the ci pipeline
  const backendUrl =
          import.meta.env.VITE_TARGET_ENVIRONMENT === "production"
          ? "http://lens/"
          : "http://lens/";
  const uiSiteMap: string[][] = [
    ["ecdc-bridgehead-test1", "Test1"]
  ];

  const genderHeaders: Map<string, string> = new Map<string, string>()
          .set("male", "male")
          .set("female", "female")
          .set("other", "other")
          .set("unknown", "unknown");

  const backendConfig = {
    url: (import.meta.env.PROD) ? backendUrl : "http://lens",
    backends: [
      "ecdc-bridgehead-test1"
    ],
    uiSiteMap: uiSiteMap,
    catalogueKeyToResponseKeyMap: catalogueKeyToResponseKeyMap,
  };

  const barChartBackgroundColors: string[] = ["#4dc9f6","#3da4c7"];
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
        <lens-result-table pageSize="10" >
        </lens-result-table>
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
      <div class="chart-wrapper chart-age-distribution">
        <lens-chart
                title="Hospital ID"
                catalogueGroupCode="hospital_id"
                chartType="bar"
                xAxisTitle="ID"
                yAxisTitle="Number of patients"
                backgroundColor={JSON.stringify(barChartBackgroundColors)}
        />
      </div>
      <div class="chart-wrapper chart-age-distribution">
        <lens-chart
                title="Laboratory code"
                catalogueGroupCode="laboratory_code"
                chartType="bar"
                xAxisTitle="Code"
                yAxisTitle="Number of patients"
                backgroundColor={JSON.stringify(barChartBackgroundColors)}
        />
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
                  yAxisTitle="Number of patients"
                  backgroundColor={JSON.stringify(barChartBackgroundColors)}
          />
        </div>
        <div class="chart-wrapper">
          <lens-chart
                  title="Antibiotic Code"
                  catalogueGroupCode="antibiotic_code"
                  chartType="bar"
                  xAxisTitle="Code"
                  yAxisTitle="Number of patients"
                  backgroundColor={JSON.stringify(barChartBackgroundColors)}
          />
        </div>
        <div class="chart-wrapper">
          <lens-chart
                  title="SIR Code"
                  catalogueGroupCode="sir_code"
                  chartType="bar"
                  xAxisTitle="Code"
                  yAxisTitle="Number of patients"
                  backgroundColor={JSON.stringify(barChartBackgroundColors)}
          />
        </div>
        <div class="chart-wrapper">
          <lens-chart
                  title="Data source"
                  catalogueGroupCode="data_source"
                  chartType="bar"
                  xAxisTitle="Code"
                  yAxisTitle="Number of patients"
                  backgroundColor={JSON.stringify(barChartBackgroundColors)}
          />
        </div>
        <div class="chart-wrapper">
          <lens-chart
                  title="Isolate ID"
                  catalogueGroupCode="isolate_id"
                  chartType="bar"
                  xAxisTitle="ID"
                  yAxisTitle="Number of patients"
                  backgroundColor={JSON.stringify(barChartBackgroundColors)}
          />
        </div>
        <div class="chart-wrapper">
          <lens-chart
                  title="Patient type"
                  catalogueGroupCode="patient_type"
                  chartType="bar"
                  xAxisTitle="Type"
                  yAxisTitle="Number of patients"
                  backgroundColor={JSON.stringify(barChartBackgroundColors)}
          />
        </div>
        <div class="chart-wrapper">
          <lens-chart
                  title="Reference guidelines SIR"
                  catalogueGroupCode="reference_guidelines_sir"
                  chartType="bar"
                  xAxisTitle="Guidelines"
                  yAxisTitle="Number of patients"
                  backgroundColor={JSON.stringify(barChartBackgroundColors)}
          />
        </div>
        <div class="chart-wrapper chart-age-distribution">
          <lens-chart
                  title="Reporting country"
                  catalogueGroupCode="reporting_country"
                  chartType="bar"
                  xAxisTitle="Country"
                  yAxisTitle="Number of patients"
                  backgroundColor={JSON.stringify(barChartBackgroundColors)}
          />
        </div>
      </div>
    </div>
  </div>
</main>

<lens-options options={libraryOptions} catalogueData={mockCatalogueData}/>
