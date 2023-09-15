<script lang="ts">
  import "../../lib";
  import type { CatalogueText } from "../../lib/src/types/texts";
  import type { Category } from "../../lib/src/types/treeData";
  import { diagnoses } from '../catalogue-ccp'

  const mockCatalogueData: Category[] = [
    {
      key: "donor",
      name: "Donor/Clinical Information",
      childCategories: [
        {
          key: "gender",
          name: "Gender",
          type: "single-select",
          criteria: [
            {
              key: "male",
              name: "male",
            },
            {
              key: "female",
              name: "female",
            },
            {
              key: "other",
              name: "other",
            },
            {
              key: "sex_uncharted",
              name: "sex uncharted",
            },
          ],
        },
        {
          key: "diagnosis",
          name: "Diagnosis ICD-10",
          type: "autocomplete",
          criteria: diagnoses,
        },
        {
          key: "diagnosis_age_donor",
          name: "Diagnosis age",
          type: "number",
        },
      ],
    },
  ];

  const catalogueText: CatalogueText = {
    group: "Group",
    collapseButtonTitle: "Collapse Tree",
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
      treeData={JSON.stringify(mockCatalogueData)}
      noMatchesFoundMessage={"No matches found"}
    />
  </div>
  <div class="grid">
    <div
      class="catalogue"
      style={`max-width: ${catalogueopen ? "400px" : "288px"};`}
      >
      <lens-catalogue
        treeData={JSON.stringify(mockCatalogueData)}
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
      <lens-result-summary
        title="Results"
        resultSummaryDataTypes={JSON.stringify(["Patients", "Samples", "sites"])}
        negotiateButton={true}
        negotiateButtonText="Negotiate with biobanks"
      />
      <lens-result-table pageSize="3" title="Responding sites"/>
      <lens-chart
        class="chart1"
        title="Age at Diagnosis"
        hintText="Lorem ipsum dolor sit amet consectetur adipisicing elit."
        chartData={JSON.stringify(chart1Data)}
      />
      <lens-chart
        title="Patients Per Site"
        hintText="Lorem ipsum dolor sit amet consectetur adipisicing elit.Lorem ipsum dolor sit amet consectetur adipisicing elit."
        chartData={JSON.stringify(chart2Data)}
      />
      <lens-chart title="Gender" chartData={JSON.stringify(chart3Data)} />
      <lens-chart
        title="Diagnosis"
        hintText="Lorem ipsum dolor sit amet consectetur adipisicing elit."
        chartData={JSON.stringify(chart4Data)}
      />
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

<!-- <main>
  <div class="container">
    <h2>Search bar</h2>
    <div class="componentBox">
      <lens-search-bar
        treeData={JSON.stringify(mockCatalogueData)}
        noMatchesFoundMessage={"No matches found"}
      />
    </div>
    <h2>Search button</h2>
    <div class="componentBox">
      <lens-search-button title="Search Biobanks" url='BACKEND_TARGET_URL'/>
    </div>
    <h2>Catalogue</h2>
    <div class="componentBox">
      <lens-catalogue
        treeData={JSON.stringify(mockCatalogueData)}
        texts={catalogueText}
        open={true}
      />
    </div>
    <h2>Query display</h2>
    <div class="componentBox">
      <lens-query-display />
    </div>
    <h2>State display</h2>
    <div class="componentBox">
      <lens-state-display />
    </div>
  </div>
</main> -->
