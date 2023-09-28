<script lang="ts">
  import "../../lib";
  import type { CatalogueText } from "../../lib/src/types/texts";
  import {  
      patientsMeasure,
      diagnosisMeasure,
      specimenMeasure,
      proceduresMeasure,
      medicationStatementsMeasure,
    } from './measures'

  let mockCatalogueData = ''
  
  fetch("catalogues/catalogue-example.json").then((response) => response.text()).then((data) => {
    mockCatalogueData = data
  })


  const measures = [
    patientsMeasure,
      diagnosisMeasure,
      specimenMeasure,
      proceduresMeasure,
      medicationStatementsMeasure,
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

  let catalogueopen = true;

  const resultSummaryConfig = [
    {
      key: 'sites',
      title: 'Sites',
    },
    {
      key: 'patients',
      title: 'Patients',
    },
  ]
</script>

<main>
  
  <h2>Search Button</h2>
  <div class="componentBox">
    <lens-search-button measures={measures} />
  </div>

  <h2>Result Summary Bar</h2>
  <div class="componentBox">
    <lens-result-summary
      title="Results"
      resultSummaryDataTypes={JSON.stringify(resultSummaryConfig)}
      negotiateButton={true}
      negotiateButtonText="Negotiate with biobanks"
    />
  </div>

  <h2>Result Table</h2>
  <div class="componentBox">
    <lens-result-table pageSize="3" title="Responding sites" />
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

  <h2>Catalogue</h2>
  <div class="componentBox">
    <lens-catalogue
      treeData={mockCatalogueData}
      texts={catalogueText}
      toggle={{ collapsable: true, open: catalogueopen }}
    />
  </div>

  <h2>Search bars</h2>
  <div class="componentBox">
    <lens-search-bar-multiple
      treeData={mockCatalogueData}
      noMatchesFoundMessage={"No matches found"}
    >
    </lens-search-bar-multiple>
  </div>

  <h2>State display</h2>
  <div class="componentBox">
    <lens-state-display />
  </div>

</main>
