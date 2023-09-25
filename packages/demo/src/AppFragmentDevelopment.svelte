<script lang="ts">
  import "../../lib";
  import type { CatalogueText } from "../../lib/src/types/texts";
  import type { Category } from "../../lib/src/types/treeData";
  // import * as mockCatalogueData from "./catalogues/catalogue-example.json"
  
  let mockCatalogueData = ''
  
  fetch("catalogues/catalogue-example.json").then((response) => response.text()).then((data) => {
    mockCatalogueData = data
  })
  
  // $: console.log(mockCatalogueData)

          
  // const mockCatalogueData: Category[] = [
  //   {
  //     key: "donor",
  //     name: "Donor/Clinical Information",
  //     childCategories: [
  //       {
  //         key: "gender",
  //         name: "Gender",
  //         type: "EQUALS",
  //         fieldType: "single-select",
  //         criteria: [
  //           {
  //             key: "male",
  //             name: "male",
  //           },
  //           {
  //             key: "female",
  //             name: "female",
  //           },
  //           {
  //             key: "other",
  //             name: "other",
  //           },
  //           {
  //             key: "sex_uncharted",
  //             name: "sex uncharted",
  //           },
  //         ],
  //       },
  //       {
  //         key: "diagnosis",
  //         name: "Diagnosis ICD-10",
  //         type: "EQUALS",
  //         fieldType: "autocomplete",
  //         criteria: [
  //           {
  //             key: "C31",
  //             name: "C31",
  //             description: "Malignant neoplasm of accessory sinuses",
  //           },
  //           {
  //             key: "C31.0",
  //             name: "C31.0",
  //             description: "Malignant neoplasm: Maxillary sinus",
  //           },
  //           {
  //             key: "C41",
  //             name: "C41",
  //             description:
  //               "Malignant neoplasm of bone and articular cartilage of other and unspecified sites",
  //           },
  //           {
  //             key: "C41.0",
  //             name: "C41.0",
  //             description: "Malignant neoplasm: Bones of skull and face",
  //           },
  //         ],
  //       },
  //       {
  //         key: "diagnosis_age_donor",
  //         name: "Diagnosis age",
  //         fieldType: "number",
  //         type: "BETWEEN",
  //       },
  //     ],
  //   },
  // ];

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
</script>

<main>
  <h2>Catalogue</h2>
  <div class="componentBox">
    <!-- <pre>{mockCatalogueData}</pre> -->
    <lens-catalogue
    treeData={mockCatalogueData}
    texts={catalogueText}
    open={true}
    />
  </div>
    <!-- <h2>Search bars</h2>
    <div class="componentBox">
      <lens-search-bar-multiple
        treeData={JSON.stringify(mockCatalogueData)}
        noMatchesFoundMessage={"No matches found"}
      />
    </div> -->
    <h2>State display</h2>
    <div class="componentBox">
      <lens-state-display />
    </div>
    <!-- <h2>Search Button</h2>
    <div class="componentBox">
      <lens-search-button
      />
    </div>
    
    <h2>Result Summary Bar</h2>
    <div class="componentBox">
    <lens-result-summary
      title="Results"
      resultSummaryDataTypes={JSON.stringify(["Patients", "Samples", "sites"])}
      negotiateButton={true}
      negotiateButtonText="Negotiate with biobanks"
    />
    </div>
    <h2>Result Table</h2>
    <div class="componentBox">
      <lens-result-table pageSize="3" title="Responding sites"/>
    </div>
    <h2>Result Table</h2>
    <div class="componentBox">
      <div>

        <lens-chart
        class="chart1"
        title="Age at Diagnosis"
        hintText="Lorem ipsum dolor sit amet consectetur adipisicing elit."
        chartData={JSON.stringify(chart1Data)}
        />
      </div>
    </div>
     -->
</main>
