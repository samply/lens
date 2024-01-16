<script lang="ts">
  import "../../lib";
  import type { CatalogueText } from "../../lib/src/types/texts";
  import {
    dktkDiagnosisMeasure,
    dktkMedicationStatementsMeasure,
    dktkPatientsMeasure,
    dktkProceduresMeasure,
    dktkSpecimenMeasure,
  } from "./measures";

  let mockCatalogueData = "";
  let libraryOptions = ""

  fetch("catalogues/catalogue-dktk.json")
    .then((response) => response.text())
    .then((data) => {
      mockCatalogueData = data;
    });

  fetch("options.json")
    .then((response) => response.json())
    .then((data) => {
      libraryOptions = data
    });

  const measures = [
    dktkPatientsMeasure,
    dktkDiagnosisMeasure,
    dktkSpecimenMeasure,
    dktkProceduresMeasure,
    dktkMedicationStatementsMeasure,
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

  const resultSummaryConfig = [
    {
      key: "sites",
      title: "Standorte",
    },
    {
      key: "patients",
      title: "Patienten",
    },
  ];

  const catalogueKeyToResponseKeyMap = [
    ["gender", "Gender"],
    ["age_at_diagnosis", "Age"],
    ["diagnosis", "diagnosis"],
    ["medicationStatements", "MedicationType"],
    ["sample_kind", "sample_kind"],
    ["therapy_of_tumor", "ProcedureType"],
    ["75186-7", "75186-7"],
    // ["encounter", "Encounter"],
  ];

  const siteToDefaultCollectionId: string[][] = [
    ["dresden", "bbmri-eric:ID:DE_BBD:collection:DILB"],
    ["frankfurt", "bbmri-eric:ID:DE_iBDF:collection:UCT"],
    ["berlin", "bbmri-eric:ID:DE_ZeBanC:collection:Onoloy"],
    ["wuerzburg", "bbmri-eric:ID:DE_ibdw:collection:bc"],
    ["brno", "bbmri-eric:ID:CZ_MMCI:collection:LTS"],
    ["aachen", "bbmri-eric:ID:DE_RWTHCBMB:collection:RWTHCBMB_BC"],
    ["leipzig", "bbmri-eric:ID:DE_LMB:collection:LIFE_ADULT"],
    [
      "muenchen-hmgu",
      "bbmri-eric:ID:DE_Helmholtz-MuenchenBiobank:collection:DE_KORA",
    ],
    ["Pilsen", "bbmri-eric:ID:CZ_CUNI_PILS:collection:serum_plasma"],
    ["regensburg", "bbmri-eric:ID:DE_ZBR:collection:Tissue"],
    ["heidelberg", "bbmri-eric:ID:DE_BMBH:collection:Lungenbiobank"],
    ["luebeck", "bbmri-eric:ID:DE_ICBL:collection:ICBL"],
    ["augsburg", "bbmri-eric:ID:DE_ACBB:collection:TISSUE"],
    ["mannheim", "bbmri-eric:ID:DE_BioPsy:collection:Main_collecion"],
    ["marburg", "bbmri-eric:ID:DE_CBBMR:collection:main"],
    ["goettingen", "bbmri-eric:ID:DE_UMGB:collection:UMG-startegy"],
    ["hannover", "bbmri-eric:ID:DE_HUB:collection:ProBase"],
    ["olomouc", "bbmri-eric:ID:CZ_UPOL_LF:collection:all_samples"],
    ["prague-ffm", "bbmri-eric:ID:CZ_CUNI_PILS:collection:serum_plasma"],
    ["prague-ior", "bbmri-eric:ID:CZ_CUNI_LF1:collection:all_samples"],
  ];

  const uiSiteMap: string[][] = [
    ["berlin", "Berlin"],
    ["bonn", "Bonn"],
    ["dresden", "Dresden"],
    ["essen", "Essen"],
    ["frankfurt", "Frankfurt"],
    ["freiburg", "Freiburg"],
    ["hannover", "Hannover"],
    ["mainz", "Mainz"],
    ["muenchen-lmu", "München(LMU)"],
    ["muenchen-tum", "München(TUM)"],
    ["ulm", "Ulm"],
    ["wuerzburg", "Würzburg"],
    ["mannheim", "Mannheim"],
    ["dktk-test", "DKTK-Test"],
    ["hamburg", "Hamburg"],
  ];

  // VITE_TARGET_ENVIRONMENT should be set by the ci pipeline
  const backendUrl = (import.meta.env.VITE_TARGET_ENVIRONMENT === "production")
               ? "https://backend.data.dktk.dkfz.de/prod/"
               : "https://backend.demo.lens.samply.de/prod/"

  const backendConfig = {
    url: "http://localhost:8080",
    backends: [
      "mannheim",
      "freiburg",
      "muenchen-tum",
      "hamburg",
      "frankfurt",
      "berlin",
      "dresden",
      "mainz",
      "muenchen-lmu",
      "essen",
      "ulm",
      "wuerzburg",
      "hannover",
    ],
    uiSiteMap: uiSiteMap,
    catalogueKeyToResponseKeyMap: catalogueKeyToResponseKeyMap,
  };

  const genderHeaders: Map<string, string> = new Map<string, string>()
    .set("male", "männlich")
    .set("female", "weiblich")
    .set("other", "divers, intersexuell")
    .set("unknown", "unbekannt");

  const vitalStateHeaders: Map<string, string> = new Map<string, string>()
    .set("lebend", "alive")
    .set("verstorben", "deceased")
    .set("unbekannt", "unknown");

  const therapyHeaders: Map<string, string> = new Map<string, string>().set(
    "medicationStatements",
    "Sys. T"
  );

</script>

<main>
  <h2>Search Button</h2>
  <div class="componentBox">
    <lens-search-button
    title="Suchen"
    {measures}
    backendConfig={JSON.stringify(backendConfig)}
    {backendMeasures}
  />
  </div>

  <h2>Negotiator Button</h2>
  <div class="componentBox">
    <lens-negotiator-button />
  </div>

  <h2>Result Table</h2>
  <div class="componentBox">
    <lens-result-table pageSize="3" title="Responding sites" />
  </div>

  <h2>Result Pie Chart</h2>
  <div class="componentBox">
      <lens-chart
        title="Gender distribution"
        catalogueGroupCode='gender'
        chartType="pie"
      />
  </div>

  <h2>Result Summary Bar</h2>
  <div class="componentBox">
    <lens-result-summary
      title="Results"
      resultSummaryDataTypes={JSON.stringify(resultSummaryConfig)}
      negotiateButtonText="Negotiate with biobanks"
    />
  </div>

  <h2>Result Bar Chart</h2>
  <div class="componentBox">
      <lens-chart
        title="Alter bei Erstdiagnose"
        catalogueGroupCode='age_at_diagnosis'
        chartType="bar"
      />
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
    />
  </div>
  <div class="componentBox">
    <lens-search-bar
      treeData={mockCatalogueData}
      noMatchesFoundMessage={"No matches found"}
    />
  </div>

  <h2>State display</h2>
  <div class="componentBox">
    <lens-state-display />
  </div>
</main>

<lens-options options={libraryOptions} catalogueData={mockCatalogueData}/>
