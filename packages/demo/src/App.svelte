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
    collapseButtonTitle: "Collapse Tree",
    numberInput: {
      labelFrom: "From",
      labelTo: "to",
    },
  };

  let catalogueopen = false;
</script>

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
      <lens-search-button title="Search Biobanks" url='https://jsonplaceholder.typicode.com/todos/1'/>
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

<header>
  <div class="logo">
    <img src="../public/logo-dkfz.svg" alt="Biobank Sweden logo" />
  </div>
  <h1>Das neue super tolle Lens</h1>
</header>
<main>
  <div class="search">
    <lens-search-bar
      treeData={JSON.stringify(mockCatalogueData)}
      noMatchesFoundMessage={"No matches found"}
    />
    <lens-search-button
      title="Search Biobanks"
      url="https://jsonplaceholder.typicode.com/todos/1"
    />
  </div>
  <div class="query-display">
    <lens-query-display />
  </div>

  <div class="grid">
    <div
      class="catalogue"
      style={`max-width: ${catalogueopen ? "1000px" : "250px"}`}
    >
      <lens-catalogue
        treeData={JSON.stringify(mockCatalogueData)}
        texts={catalogueText}
        toggle='{{ collapsable: false, open: true }}'
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
      <h1>Ergebnisse</h1>
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

<style>
  /* .componentBox {
    background-color: rgb(255, 255, 255);
    padding: 20px;
    margin: 50px 0;
    border-radius: 5px;
  } */
</style>
