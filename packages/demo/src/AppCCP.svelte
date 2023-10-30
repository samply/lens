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
    url: (import.meta.env.PROD) ? backendUrl : "http://localhost:8080",
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


<header>
  <div class="logo">
    <img src="../dktk.svg" alt="Logo des DKTK" />
  </div>
  <h1>CCP Explorer</h1>
  <div class="logo logo-dkfz">
    <img
      src="../Deutsches_Krebsforschungszentrum_Logo.svg"
      alt="Logo des DKTK"
    />
  </div>
</header>
<main>
  <div class="search">
    <lens-search-bar
      treeData={mockCatalogueData}
      noMatchesFoundMessage={"keine Ergebnisse gefunden"}
    />
    <lens-info-button
      infoIconUrl="info-circle-svgrepo-com.svg"
      noQueryMessage="Leere Suchanfrage: Sucht nach allen Ergebnissen."
      showQuery={true}
    />
    <lens-search-button
      title="Suchen"
      {measures}
      backendConfig={JSON.stringify(backendConfig)}
      {backendMeasures}
    />
  </div>
  <div class="grid">
    <div class="catalogue">
      <h2>Suchkriterien</h2>
      <lens-info-button
        infoIconUrl="info-circle-svgrepo-com.svg"
        message={[
          `Bei Patienten mit mehreren onkologischen Diagnosen, können sich ausgewählte Suchkriterien nicht nur auf eine Erkrankung beziehen, sondern auch auf Weitere.`,
          `Innerhalb einer Kategorie werden verschiedene Ausprägungen mit einer „Oder-Verknüpfung“ gesucht; bei der Suche über mehrere Kategorien mit einer „Und-Verknüpfung“.`
        ]}
      />
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
      <div class="chart-wrapper result-summary">
        <lens-result-summary
          title="Ergebnisse"
          resultSummaryDataTypes={JSON.stringify(resultSummaryConfig)}
        />
        <lens-search-modified-display>Diagramme repräsentieren nicht mehr die aktuelle Suche!</lens-search-modified-display>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Patienten pro Standort"
          catalogueGroupCode="patients"
          perSite={true}
          displayLegends={true}
          chartType="pie"
        />
      </div>
      <div class="chart-wrapper result-table">
        <lens-result-table pageSize="10" />
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Geschlecht"
          catalogueGroupCode="gender"
          chartType="pie"
          displayLegends={true}
          headers={genderHeaders}
        />
      </div>
      <div class="chart-wrapper chart-diagnosis">
        <lens-chart
          title="Diagnose"
          catalogueGroupCode="diagnosis"
          chartType="bar"
          indexAxis="y"
          groupingDivider="."
          groupingLabel=".%"
          filterRegex="^[CD].*"
          xAxisTitle="Anzahl der Diagnosen"
          yAxisTitle="ICD-10-Codes"
        />
      </div>
      <div class="chart-wrapper chart-age-distribution">
        <lens-chart
          title="Alter bei Erstdiagnose"
          catalogueGroupCode="age_at_diagnosis"
          chartType="bar"
          groupRange={10}
          filterRegex="^(1*[12]*[0-9])"
          xAxisTitle="Alter"
          yAxisTitle="Anzahl der Primärdiagnosen"
        />
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Vitalstatus"
          catalogueGroupCode="75186-7"
          chartType="pie"
          displayLegends={true}
          headers={vitalStateHeaders}
        />
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Therapieart"
          catalogueGroupCode="therapy_of_tumor"
          chartType="bar"
          headers={therapyHeaders}
          xAxisTitle="Art der Therapie"
          yAxisTitle="Anzahl der Therapien"
        />
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Systemische Therapien"
          catalogueGroupCode="medicationStatements"
          chartType="bar"
          xAxisTitle="Art der Therapie"
          yAxisTitle="Anzahl der Therapien"
        />
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Proben"
          catalogueGroupCode="sample_kind"
          chartType="bar"
          xAxisTitle="Probentypen"
          yAxisTitle="Probenanzahl"
        >
        <div class="sample-information-text">* Es sind in der Regel auch FFPE-Gewebeproben verfügbar</div>
    </lens-chart>
      </div>
    </div>
  </div>
</main>

<footer>
  <a class="user-agreement" href="">Nutzervereinbarung</a>
  <a class="email" href="mailto:CCP@dkfz.de">CCP@dkfz.de</a>
  <div class="copyright">
    <span>&#169; 2023</span>
    <a href="https://dktk.dkfz.de/en/clinical-platform/about-ccp"
      >Clinical Comunication Platform (CCP)</a
    >
  </div>
</footer>
<lens-options options={libraryOptions} catalogueData={mockCatalogueData}/>
