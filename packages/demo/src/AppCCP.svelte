<script lang="ts">
  import "../../lib";
  import type { CatalogueText } from "../../lib/src/types/texts";
    import { dktkDiagnosisMeasure, dktkMedicationStatementsMeasure, dktkPatientsMeasure, dktkProceduresMeasure, dktkSpecimenMeasure } from "./measures";

  let mockCatalogueData = ''
  
  fetch("catalogues/catalogue-example.json").then((response) => response.text()).then((data) => {
    mockCatalogueData = data
  })

  const resultSummaryConfig = [
    {
      key: "sites",
      title: "Sites",
    },
    {
      key: "patients",
      title: "Patients",
    },
  ];

  const measures = [
    dktkPatientsMeasure,
    dktkDiagnosisMeasure,
    dktkSpecimenMeasure,
    dktkProceduresMeasure,
    dktkMedicationStatementsMeasure
  ];

  const catalogueText: CatalogueText = {
    group: "Group",
    collapseButtonTitle: "Collapse Tree",
    expandButtonTitle: "Expand Tree",
    numberInput: {
      labelFrom: "From",
      labelTo: "to",
    },
  };

  const chart1Data = {
    type: "bar",
    data: {
      labels: [
        "0-9",
        "10-19",
        "20-29",
        "30-39",
        "40-49",
        "50-59",
        "60-69",
        "70-79",
        "80-89",
        "90-99",
        "100-109",
        "110-119",
      ],
      datasets: [
        {
          label: "",
          data: [12, 19, 3, 5, 2, 3, 12, 19, 3, 5, 2, 3],
        },
      ],
    },
  };
  const chart2Data = {
    type: "pie",
    data: {
      labels: ["Dresden", "Mannheim", "Frankfurt", "Berlin"],
      datasets: [
        {
          label: "",
          data: [3, 5, 12, 19],
        },
      ],
    },
  };
  const chart3Data = {
    type: "pie",
    data: {
      labels: ["male", "female", "undefined", "other"],
      datasets: [
        {
          label: "",
          data: [12, 19, 3, 5],
        },
      ],
    },
  };
  const chart4Data = {
    type: "bar",
    data: {
      labels: ["C31", "C31.0", "C41", "C41.0"],
      datasets: [
        {
          label: [],
          data: [12, 100, 30, 5],
        },
      ],
    },
    options: {
      legend: {
        display: false,
      },
    },
  };

  let catalogueopen = true;

  const uiSiteMap: string[][] = [
    ["berlin", "Berlin"],
    ["bonn", "Bonn"],
    ["dresden", "Dresden"],
    ["essen", "Essen"],
    ["frankfurt", "Frankfurt"],
    ["freiburg", "Freiburg"],
    ["hannover", "Hannover"],
    ["mainz", "Mainz"],
    ["muenchen-lmu", "München(LMU],"],
    ["muenchen-tum", "München(TUM],"],
    ["ulm", "Ulm"],
    ["wuerzburg", "Würzburg"],
    ["mannheim", "Mannheim"],
    ["dktk-test", "DKTK-Test"],
    ["hamburg", "Hamburg"],

  ];

  const backendConfig = {
    url: "http://localhost:8080",
    backends: [
      'mannheim',
      'freiburg',
      'muenchen-tum',
      'hamburg',
      'frankfurt',
      'berlin',
      'dresden',
      'mainz',
      'muenchen-lmu',
      'essen',
      'ulm',
      'wuerzburg',
    ],
    uiSiteMap: uiSiteMap,
  };
</script>

<header>
  <div class="logo">
    <img src="../public/BBMRI-ERIC-gateway-for-health.svg" alt="Biobank Sweden logo" />
  </div>
  <h1>Sample Locator</h1>
</header>
<main>
  <div class="search">
    <lens-search-bar-multiple
      treeData={mockCatalogueData}
      noMatchesFoundMessage={"No matches found"}
      measures={[dktkPatientsMeasure, dktkDiagnosisMeasure, dktkSpecimenMeasure, dktkPatientsMeasure, dktkMedicationStatementsMeasure]}
    >
      <lens-search-button title="Search Biobanks" measures={measures} backendConfig={JSON.stringify(backendConfig)}/>
    </lens-search-bar-multiple>
  </div>
  <div class="grid">
    <div
      class="catalogue"
      style={`max-width: ${catalogueopen ? "400px" : "288px"};`}
      >
      <lens-catalogue
        treeData={mockCatalogueData}
        texts={catalogueText}
        toggle={{ collapsable: false, open: true }}
      />
      {#if catalogueopen}
        <button on:click={() => (catalogueopen = !catalogueopen)}>
          &#8676;
        </button>
      {:else}
        <button on:click={() => (catalogueopen = !catalogueopen)}>
          &#8677;
        </button>
      {/if}
    </div>
    <div class="charts">
      <div class="chart-wrapper result-summary">
        <lens-result-summary
        title="Results"
        resultSummaryDataTypes={JSON.stringify(resultSummaryConfig)}
        negotiateButton={true}
        negotiateButtonText="Negotiate with biobanks"
        />
      </div>
      <div class="chart-wrapper">
        <lens-result-table pageSize="3" title="Responding sites"/>
      </div>
      <div class="chart-wrapper">
        <lens-chart
        title="Age at Diagnosis"
        hintText="Lorem ipsum dolor sit amet consectetur adipisicing elit."
        chartData={JSON.stringify(chart1Data)}
        />
      </div>
      <div class="chart-wrapper">
        <lens-chart
        title="Patients Per Site"
        hintText="Lorem ipsum dolor sit amet consectetur adipisicing elit.Lorem ipsum dolor sit amet consectetur adipisicing elit."
        chartData={JSON.stringify(chart2Data)}
        />
      </div>
      <div class="chart-wrapper">
        <lens-chart title="Gender" chartData={JSON.stringify(chart3Data)} />
      </div>
      <div class="chart-wrapper">
      <lens-chart
        title="Diagnosis"
        hintText="Lorem ipsum dolor sit amet consectetur adipisicing elit."
        chartData={JSON.stringify(chart4Data)}
      />
      </div>
    </div>
  </div>
</main>

<footer>
  <h3>made with &#10084; & samply-lens</h3>
  <div class="img-container">
    <img src="../public/logo_ce-en-rvb-lr.jpg" alt="" />
  </div>
  <div class="img-container">
    <img src="../public/BMBF_logo.png" alt="" />
  </div>
</footer>
