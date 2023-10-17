<script lang="ts">
  import "../../lib";
  import type { CatalogueText } from "../../lib/src/types/texts";
    import { dktkDiagnosisMeasure, dktkMedicationStatementsMeasure, dktkPatientsMeasure, dktkProceduresMeasure, dktkSpecimenMeasure } from "./measures";

  let mockCatalogueData = "";

  fetch("catalogues/catalogue-dktk.json")
    .then((response) => response.text())
    .then((data) => {
      mockCatalogueData = data;
    });

  const measures = [
    dktkPatientsMeasure,
    dktkDiagnosisMeasure,
    dktkSpecimenMeasure,
    dktkProceduresMeasure,
    dktkMedicationStatementsMeasure
  ];

  const backendMeasures = `DKTK_STRAT_DEF_IN_INITIAL_POPULATION`

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
    ['diagnosis', 'diagnosis'],
    ['medicationStatements', "MedicationType"],
    ["sample_kind", 'sample_kind' ],
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

  const backendConfig = {
    // url: "https://backend.demo.lens.samply.de/prod/",
    url: "http://localhost:8080",
    backends: [
      'mannheim',
      'freiburg',
      'muenchen-tum',
      'hamburg',
      'frankfurt',
      'berlin',
      'dresden',
      'mainz',
      'muenchen-lmu',
      'essen',
      'ulm',
      'wuerzburg',
    ],
    uiSiteMap: uiSiteMap,
    catalogueKeyToResponseKeyMap: catalogueKeyToResponseKeyMap,
  };

  const genderHeaders: Map<string, string> = new Map<string, string>()
    .set('male', 'männlich')
    .set('female', 'weiblich')
    .set('other', 'divers, intersexuell')
    .set('unknown', 'unbekannt');

  const vitalStateHeaders: Map<string, string> = new Map<string, string>()
    .set('lebend', 'alive')
    .set('verstorben', 'deceased')
    .set('unbekannt', 'unknown');

  const therapyHeaders: Map<string, string> = new Map<string, string>()
    .set('medicationStatements', 'Sys. T');

  const therapyTooltips: Map<string, string> = new Map<string, string>()
    .set('OP', 'Operationen')
    .set('ST', 'Strahlentherapien')
    .set('medicationStatements', 'Systemische Therapien');

  const systemicTherapyTooltips: Map<string, string> = new Map<string, string>()
    .set('CH', 'Chemotherapie')
    .set('HO', 'Hormontherapie')
    .set('IM', 'Immun- und Antikörpertherapie')
    .set('KM', 'Knochenmarkstransplantation')
    .set('WS', 'Wait and see')
    .set('AS', 'Active Surveillance')
    .set('ZS', 'Zielgerichtete Substanzen')
    .set('SO', 'Sonstiges')
    .set('ST', 'Strahlentherapie')
    .set('OP', 'Operation')

  const specimenHeaders: Map<string, string> = new Map<string, string>()
    .set('whole-blood','Whole blood')
    .set('bone-marrow','Bone marrow')
    .set('buffy-coat','Buffy-Coat')
    .set('dried-whole-blood','Dried whole blood')
    .set('peripheral-blood-cells-vital','Peripheral blood mononuclear cells (PBMCs, viable)')
    .set('blood-plasma','Plasma')
    .set('blood-serum','Serum')
    .set('ascites','Ascites')
    .set('csf-liquor','CSF/Liquor')
    .set('saliva','Saliva')
    .set('stool-faeces','Stool/Faeces')
    .set('urine','Urine')
    .set('swab','Swab')
    .set('liquid-other','Other liquid biosample/storage')
    .set('tissue-ffpe','Tissue FFPE')
    .set('tissue-frozen','Tissue frozen')
    .set('tissue-other','Other tissue storage')
    .set('dna','DNA')
    .set('rna','RNA')
    .set('derivative-other','Other derivative')

</script>

<header>
  <div class="logo">
    <img src="../dktk.svg" alt="Logo des DKTK" />
  </div>
  <h1>CCP Explorer</h1>
  <div class="logo logo-dkfz">
    <img src="../Deutsches_Krebsforschungszentrum_Logo.svg" alt="Logo des DKTK" />
  </div>
</header>
<main>
  <div class="search">
    <lens-search-bar
      treeData={mockCatalogueData}
      noMatchesFoundMessage={"keine Ergebnisse gefunden"}
      measures={[dktkPatientsMeasure, dktkDiagnosisMeasure, dktkSpecimenMeasure, dktkPatientsMeasure, dktkMedicationStatementsMeasure]}
    >
  </lens-search-bar>
  <lens-info-button iconUrl='../info-circle-svgrepo-com.svg' noQueryMessage="Leere Suchanfrage: Sucht nach allen Ergebnissen." />
  <lens-search-button
    title="Suchen"
    {measures}
    backendConfig={JSON.stringify(backendConfig)}
    {backendMeasures}
  />
  </div>
  <div class="grid">
    <div class="catalogue">
      <lens-catalogue
        toggleIconUrl='right-arrow-svgrepo-com.svg'
        addIconUrl='long-right-arrow-svgrepo-com.svg'
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
          clickToAddState={true}
          headers={genderHeaders}
        />
      </div>
      <div class="chart-wrapper chart-diagnosis">
        <lens-chart
          title="Diagnose"
          catalogueGroupCode="diagnosis"
          chartType="bar"
          indexAxis='y'
          clickToAddState={true}
          groupingDivider='.'
          groupingLabel='.%'
          filterRegex='^[CD].*'
          xAxisTitle="Anzahl der Diagnosen"
          yAxisTitle="ICD-10-Codes"
        />
      </div>
      <div class="chart-wrapper chart-age-distribution">
        <lens-chart
          title="Alter bei Erstdiagnose"
          catalogueGroupCode="age_at_diagnosis"
          chartType="bar"
          clickToAddState={true}
          groupRange={10}
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
          clickToAddState={true}
          headers={vitalStateHeaders}
        />
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Therapieart"
          catalogueGroupCode="therapy_of_tumor"
          chartType="bar"
          clickToAddState={true}
          headers={therapyHeaders}
          tooltips={therapyTooltips}
          yAxisTitle="Anzahl der Therapien"
        />
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Systemische Therapien"
          catalogueGroupCode="medicationStatements"
          chartType="bar"
          clickToAddState={true}
          tooltips={systemicTherapyTooltips}
          yAxisTitle="Anzahl der Therapien"
        />
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Proben"
          catalogueGroupCode="sample_kind"
          chartType="bar"
          clickToAddState={true}
          xAxisTitle="Probentypen"
          yAxisTitle="Probenanzahl"
          tooltips={specimenHeaders}
        />
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
