<script lang="ts">
  import "../../lib";
    import type { Category } from "../../lib/src/types/treeData";

  const mockCatalogueData: Category[] = [
    {
      key: "donor",
      name: "Donor/Clinical Information",
      childCategories: [
        {
          key: "gender",
          name: "Gender",
          type: "checkbox",
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
          key: 'diagnosis_age_donor',
          name: 'Diagnosis age',
          type: 'number',
        }
      ],
    },
  ]

  


</script>

<main>
  <p class="container">
    <lens-search-bar treeData={JSON.stringify(mockCatalogueData)}  noMatchesFoundMessage={"lol idiot"}/>
    <br>
    <br>
    <br>
    <br>
    <lens-catalogue treeData={JSON.stringify(mockCatalogueData)}/>
    <!-- <lens-query-display /> -->
  </p>
</main>

