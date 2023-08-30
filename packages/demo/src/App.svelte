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
    numberInput: {
      labelFrom: "From",
      labelTo: "to",
      warning: `"from" can't be higher than "to"`,
    },
  };
</script>

<main>
  <div class="container">
    <h2>Search bar</h2>
    <div class="componentBox">
      <lens-search-bar
        treeData={JSON.stringify(mockCatalogueData)}
        noMatchesFoundMessage={"No matches found"}
      />
    </div>
    <h2>Catalogue</h2>
    <div class="componentBox">
      <lens-catalogue
        treeData={JSON.stringify(mockCatalogueData)}
        texts={catalogueText}
      />
    </div>
    <h2>Query display</h2>
    <div class="componentBox">
      <lens-query-display />
    </div>
    <h2>Results</h2>
    <div class="componentBox">
      <lens-result-mockup />
    </div>
    <h2>State display</h2>
    <div class="componentBox">
      <lens-state-display />
    </div>
  </div>
</main>

<style>
  .componentBox {
    background-color: rgb(255, 255, 255);
    padding: 20px;
    margin: 50px 0;
    border-radius: 5px;
  }
</style>
