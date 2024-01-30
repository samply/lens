<script lang="ts">
  import "../../lib";
  import type { CatalogueText } from "../../lib/src/types/texts";
  import {
    dktkPatientsMeasure
  } from "./measures";

  let mockCatalogueData = "";
  let libraryOptions = ""

  fetch("catalogues/catalogue-ecdc.json")
    .then((response) => response.text())
    .then((data) => {
      mockCatalogueData = data;
    });

  fetch("ecdc_options.json")
    .then((response) => response.json())
    .then((data) => {
      libraryOptions = data
    });

  const measures = [
    dktkPatientsMeasure
  ];

  const backendMeasures = `DKTK_STRAT_DEF_IN_INITIAL_POPULATION`;

  const catalogueText: CatalogueText = {
    group: "Group",
    collapseButtonTitle: "Collapse Tree",
    expandButtonTitle: "Expand Tree",
    numberInput: {
      labelFrom: "von",
      labelTo: "bis",
    },
  };

  let catalogueopen = false;

  const catalogueKeyToResponseKeyMap = [
    ["gender", "Gender"],
    ["age_at_diagnosis", "Age"]
  ];

  const uiSiteMap: string[][] = [
    ["croatia", "Croatia"]
  ];

  // VITE_TARGET_ENVIRONMENT should be set by the ci pipeline
  const backendUrl = (import.meta.env.VITE_TARGET_ENVIRONMENT === "production")
               ? "https://backend.data.dktk.dkfz.de/prod/"
               : "https://backend.demo.lens.samply.de/prod/"

  const backendConfig = {
    url: (import.meta.env.PROD) ? backendUrl : "http://localhost:8080",
    backends: [
      "croatia"
    ],
    uiSiteMap: uiSiteMap,
    catalogueKeyToResponseKeyMap: catalogueKeyToResponseKeyMap,
  };

  const genderHeaders: Map<string, string> = new Map<string, string>()
    .set("male", "male")
    .set("female", "female")
    .set("other", "other")
    .set("unknown", "unknown");
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
      <h2>Search criteria</h2>
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
          chartType="pie"
          displayLegends={true}
          headers={genderHeaders}
        />
      </div>
    </div>
  </div>
</main>

<lens-options options={libraryOptions} catalogueData={mockCatalogueData}/>
