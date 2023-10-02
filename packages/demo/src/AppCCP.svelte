<script lang="ts">
  import "../../lib";
  import type { CatalogueText } from "../../lib/src/types/texts";
  import {
    patientsMeasure,
    diagnosisMeasure,
    specimenMeasure,
    proceduresMeasure,
    medicationStatementsMeasure,
  } from "./measures";

  let mockCatalogueData = "";

  fetch("catalogues/catalogue-dktk.json")
    .then((response) => response.text())
    .then((data) => {
      mockCatalogueData = data;
    });

  const measures = [
    patientsMeasure,
    diagnosisMeasure,
    specimenMeasure,
    proceduresMeasure,
    medicationStatementsMeasure,
  ];

  const cqlHeader = `library Retrieve
  using FHIR version '4.0.0'
  include FHIRHelpers version '4.0.0'

  codesystem loinc: 'http://loinc.org'

  context Patient

  DKTK_STRAT_GENDER_STRATIFIER

  DKTK_STRAT_AGE_STRATIFIER

  DKTK_STRAT_DECEASED_STRATIFIER

  DKTK_STRAT_DIAGNOSIS_STRATIFIER

  DKTK_STRAT_SPECIMEN_STRATIFIER

  DKTK_STRAT_PROCEDURE_STRATIFIER

  DKTK_STRAT_MEDICATION_STRATIFIER

  DKTK_STRAT_ENCOUNTER_STRATIFIER

  DKTK_STRAT_DEF_IN_INITIAL_POPULATION
`;

  const catalogueText: CatalogueText = {
    group: "Group",
    collapseButtonTitle: "Collapse Tree",
    expandButtonTitle: "Expand Tree",
    numberInput: {
      labelFrom: "From",
      labelTo: "to",
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
    ["muenchen-lmu", "München(LMU],"],
    ["muenchen-tum", "München(TUM],"],
    ["ulm", "Ulm"],
    ["wuerzburg", "Würzburg"],
    ["mannheim", "Mannheim"],
    ["dktk-test", "DKTK-Test"],
  ];

  const catalogueKeyToResponseKeyMap = [
    ["gender", "Gender"],
    ["age_at_diagnosis", "Age"],
  ];

  const backendConfig = {
    url: "http://localhost:8080",
    backends: [
      "berlin",
      "bonn",
      "dresden",
      "essen",
      "frankfurt",
      "freiburg",
      "hannover",
      "mainz",
      "muenchen-lmu",
      "muenchen-tum",
      "ulm",
      "wuerzburg",
      "mannheim",
      "dktk-test",
    ],
    uiSiteMap: uiSiteMap,
    catalogueKeyToResponseKeyMap: catalogueKeyToResponseKeyMap,
  };
</script>

<header>
  <div class="logo">
    <img
      src="../public/BBMRI-ERIC-gateway-for-health.svg"
      alt="Biobank Sweden logo"
    />
  </div>
  <h1>Sample Locator</h1>
</header>
<main>
  <div class="search">
    <lens-search-bar-multiple
      treeData={mockCatalogueData}
      noMatchesFoundMessage={"No matches found"}
      measures={[
        patientsMeasure,
        diagnosisMeasure,
        specimenMeasure,
        proceduresMeasure,
        medicationStatementsMeasure,
      ]}
    >
      <lens-search-button
        {measures}
        backendConfig={JSON.stringify(backendConfig)}
        {cqlHeader}
      />
    </lens-search-bar-multiple>
  </div>
  <div class="grid">
    <div class="catalogue">
      <!-- style={`max-width: ${catalogueopen ? "400px" : "288px"};`} -->
      <lens-catalogue
        treeData={mockCatalogueData}
        texts={catalogueText}
        toggle={{ collapsable: false, open: catalogueopen }}
      />
    </div>
    <div class="charts">
      <div class="chart-wrapper result-summary">
        <lens-result-summary
          title="Ergebnisse"
          resultSummaryDataTypes={JSON.stringify(resultSummaryConfig)}
        />
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Patienten pro Standort"
          catalogueGroupCode="patients"
          perSite={true}
          chartType="pie"
        />
      </div>
      <div class="chart-wrapper">
        <lens-result-table pageSize="10" title="Responding sites" />
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Age at Diagnosis"
          hintText="Lorem ipsum dolor sit amet consectetur adipisicing elit."
          catalogueGroupCode="age_at_diagnosis"
          chartType="bar"
        />
      </div>
        <div class="chart-wrapper">
          <lens-chart
            title="Gender distribution"
            catalogueGroupCode="gender"
            chartType="pie"
          />
        </div>
        <div class="chart-wrapper">
          <lens-chart
            title="Diagnosis"
            hintText="Lorem ipsum dolor sit amet consectetur adipisicing elit."
            catalogueGroupCode="diagnosis"
            chartType="bar"
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
