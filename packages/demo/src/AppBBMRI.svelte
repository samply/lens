<script lang="ts">
  import "../../lib";
  import type { CatalogueText } from "../../lib/src/types/texts";
  import type { Category } from "../../lib/src/types/treeData";

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
          criteria: [
            {
              key: "C31",
              name: "C31",
              description: "Malignant neoplasm of accessory sinuses",
            },
            {
              key: "C31.0",
              name: "C31.0",
              description: "Malignant neoplasm: Maxillary sinus",
            },
            {
              key: "C41",
              name: "C41",
              description:
                "Malignant neoplasm of bone and articular cartilage of other and unspecified sites",
            },
            {
              key: "C41.0",
              name: "C41.0",
              description: "Malignant neoplasm: Bones of skull and face",
            },
          ],
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
    collapseButtonTitle: "Full Parameter Search",
    numberInput: {
      labelFrom: "from",
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
    type: "bar",
    data: {
      labels: ["Plasma", "White-Blood", "DNA", "RNA"],
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
      labels: [
        "C31",
        "C31.0",
        "C41",
        "C41.0",
        "C00",
        `C01`,
        `C02`,
        `C04`,
        `C05`,
        `C06`,
        `C07`,
        `C08`,
        `C09`,
        `C10`,
        `C11`,
        `C12`,
        `C13`,
        `C14`,
        "C31",
        "C31.0",
        "C41",
        "C41.0",
        "C00",
        `C01`,
        `C02`,
        `C04`,
        `C05`,
        `C06`,
        `C07`,
        `C08`,
        `C09`,
        `C10`,
        `C11`,
        `C12`,
        `C13`,
        `C14`,
      ],
      datasets: [
        {
          label: [],
          data: [
            12, 100, 30, 5, 12, 19, 3, 12, 19, 3, 12, 19, 3, 12, 12, 19, 3, 1,
            12, 100, 30, 5, 12, 19, 3, 12, 19, 3, 12, 19, 3, 12, 12, 19, 3, 1,
          ],
        },
      ],
    },
    options: {
      legend: {
        display: false,
      },
    },
  };
  const chartColors: string[] = [
    "#003674",
    "#1a4a82",
    "#335e90",
    "#4d729e",
    "#6686ac",
    "#809bba",
    "#99afc7",
  ];

  const chartBackgroudnColors: string[] = ["#e95713"];

  let catalogueopen = true;
</script>

<header>
  <div class="logo">
    <img
      src="../public/BBMRI-ERIC-gateway-for-health.svg"
      alt="Biobank Sweden logo"
    />
  </div>
  <div class="menu">
    <a href="https://www.bbmri-eric.eu/about/">About Us</a>
    <a href="mailto:locator@helpdesk.bbmri-eric.eu">Contact</a>
    <a href="https://www.bbmri-eric.eu/bbmri-sample-and-data-portal/">Logout</a>
  </div>
</header>
<main>
  <div class="headings">
    <h1>BBMRI-ERIC Locator</h1>
    <h2>Search for human biospecimens across European biobanks</h2>
  </div>
  <div class="search">
    <lens-search-bar-multiple
      treeData={JSON.stringify(mockCatalogueData)}
      noMatchesFoundMessage={"No matches found"}
    />
  </div>
  <div class="grid">
    <div
      class="catalogue"
      style={`max-width: ${catalogueopen ? "1000px" : "288px"}`}
    >
      <lens-catalogue
        treeData={JSON.stringify(mockCatalogueData)}
        texts={catalogueText}
        toggle={{ collapsable: true, open: false }}
      />
    </div>
    <div class="charts">
      <div class="chart-wrapper summary-bar">
        <lens-result-summary
          title="Results"
          resultSummaryDataTypes={JSON.stringify([
            "Sites",
            "Patients",
            "Specimens",
          ])}
        />
      </div>
      <div class="chart-wrapper result-table">
        <lens-result-table pageSize="3" title="Responding sites" />
      </div>
      <div class="chart-wrapper chart-gender-distribution">
        <lens-chart
          title="Gender Distribution"
          chartData={JSON.stringify(chart3Data)}
          backgroundColors={JSON.stringify(chartColors)}
          backgroundHoverColors={JSON.stringify(chartBackgroudnColors)}
        />
      </div>
      <div class="chart-wrapper chart-age-distribution">
        <lens-chart
          title="Age Distribution"
          chartData={JSON.stringify(chart1Data)}
          backgroundColors={JSON.stringify(chartColors)}
          backgroundHoverColors={JSON.stringify(chartBackgroudnColors)}
        />
      </div>
      <div class="chart-wrapper chart-specimens">
        <lens-chart
          title="Specimens"
          chartData={JSON.stringify(chart2Data)}
          backgroundColors={JSON.stringify(chartColors)}
          backgroundHoverColors={JSON.stringify(chartBackgroudnColors)}
        />
      </div>
      <div class="chart-wrapper chart-diagnosis">
        <lens-chart
          title="Diagnosis"
          chartData={JSON.stringify(chart4Data)}
          backgroundColors={JSON.stringify(chartColors)}
          backgroundHoverColors={JSON.stringify(chartBackgroudnColors)}
        />
      </div>
    </div>
  </div>
</main>

<footer>
  <a href="https://www.bbmri-eric.eu/privacy-notice/">Privacy Policy</a>
  <a href="">made with &#10084; & samply-lens</a>
  <div class="img-container">
    <img
      src="../public/logo-dkfz.svg"
      alt="german cancer research center logo"
    />
  </div>
  <div class="img-container">
    <img src="../public/GBN_logo.svg" alt="german biobank node logo" />
  </div>
  <div class="img-container">
    <img src="../public/logo_ce-en-rvb-lr.jpg" alt="european commission logo" />
  </div>
</footer>
