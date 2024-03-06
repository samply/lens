<script lang="ts">
    import DataPasser from "../../lib/src/components/DataPasser.wc.svelte";
    import type { QueryItem, QueryValue } from "../../lib/src/types/queryData";

    import {
        dktkDiagnosisMeasure,
        dktkMedicationStatementsMeasure,
        dktkPatientsMeasure,
        dktkProceduresMeasure,
        dktkSpecimenMeasure,
        dktkHistologyMeasure,
    } from "./measures";

    let mockCatalogueData = "";
    let libraryOptions = "";

    fetch("catalogues/catalogue-dktk.json")
        .then((response) => response.text())
        .then((data) => {
            mockCatalogueData = data;
        });

    fetch("options.json")
        .then((response) => response.json())
        .then((data) => {
            libraryOptions = data;
        });

    const measures = [
        dktkPatientsMeasure,
        dktkDiagnosisMeasure,
        dktkSpecimenMeasure,
        dktkProceduresMeasure,
        dktkMedicationStatementsMeasure,
        dktkHistologyMeasure,
    ];

    const backendMeasures = `DKTK_STRAT_DEF_IN_INITIAL_POPULATION`;

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

    const uiSiteMap: string[][] = [
        ["berlin", "Berlin"],
        ["berlin-test", "Berlin"],
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
        ["hamburg", "Hamburg"],
    ];

    //   bbmri sites
    //   const siteToDefaultCollectionId: string[][] = [
    //     ["dresden", "bbmri-eric:ID:DE_BBD:collection:DILB"],
    //     ["frankfurt", "bbmri-eric:ID:DE_iBDF:collection:UCT"],
    //     ["berlin", "bbmri-eric:ID:DE_ZeBanC:collection:Onoloy"],
    //     ["wuerzburg", "bbmri-eric:ID:DE_ibdw:collection:bc"],
    //     ["brno", "bbmri-eric:ID:CZ_MMCI:collection:LTS"],
    //     ["aachen", "bbmri-eric:ID:DE_RWTHCBMB:collection:RWTHCBMB_BC"],
    //     ["leipzig", "bbmri-eric:ID:DE_LMB:collection:LIFE_ADULT"],
    //     ["muenchen-hmgu", "bbmri-eric:ID:DE_Helmholtz-MuenchenBiobank:collection:DE_KORA"],
    //     ["Pilsen", "bbmri-eric:ID:CZ_CUNI_PILS:collection:serum_plasma"],
    //     ["regensburg", "bbmri-eric:ID:DE_ZBR:collection:Tissue"],
    //     ["heidelberg", "bbmri-eric:ID:DE_BMBH:collection:Lungenbiobank"],
    //     ["luebeck", "bbmri-eric:ID:DE_ICBL:collection:ICBL"],
    //     ["augsburg", "bbmri-eric:ID:DE_ACBB:collection:TISSUE"],
    //     ["mannheim", "bbmri-eric:ID:DE_BioPsy:collection:Main_collecion"],
    //     ["marburg", "bbmri-eric:ID:DE_CBBMR:collection:main"],
    //     ["goettingen", "bbmri-eric:ID:DE_UMGB:collection:UMG-startegy"],
    //     ["hannover", "bbmri-eric:ID:DE_HUB:collection:ProBase"],
    //     ["olomouc", "bbmri-eric:ID:CZ_UPOL_LF:collection:all_samples"],
    //     ["prague-ffm", "bbmri-eric:ID:CZ_CUNI_PILS:collection:serum_plasma"],
    //     ["prague-ior", "bbmri-eric:ID:CZ_CUNI_LF1:collection:all_samples"],
    //   ];

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
        ],
        uiSiteMap: uiSiteMap,
        catalogueKeyToResponseKeyMap: catalogueKeyToResponseKeyMap,
    };

    let queryStore: QueryItem[][] = [];

    let dataPasser: DataPasser;

    const getQuery = (): void => {
        console.log(dataPasser, dataPasser.getQueryAPI());
        queryStore = dataPasser.getQueryAPI();
    };

    const getResponse = (): void => {
        console.log(dataPasser, dataPasser.getResponseAPI());
    };

    const getAST = (): void => {
        console.log(dataPasser, dataPasser.getAstAPI());
    };

    const removeItem = (queryObject: QueryItem): void => {
        dataPasser.removeItemFromQuyeryAPI({ queryObject });
        getQuery();
    };

    const removeValue = (queryItem: QueryItem, value: QueryValue): void => {
        console.log(queryItem, value);
        dataPasser.removeValueFromQueryAPI({ queryItem, value });
        getQuery();
    };
</script>

<main>
    <h2>Data Passer</h2>
    <div class="componentBox">
        <lens-data-passer bind:this={dataPasser} />
        <button on:click={() => getQuery()}>Get Query Store</button>
        <button on:click={() => getResponse()}>Get Response Store</button>
        <button on:click={() => getAST()}>Get AST</button>
        {#each queryStore as queryStoreGroup}
            <div>
                {#each queryStoreGroup as queryStoreItem}
                    <div>
                        <button on:click={() => removeItem(queryStoreItem)}>
                            remove {queryStoreItem.name}:
                        </button>
                        <ul>
                            {#each queryStoreItem.values as queryStoreValue}
                                <li>
                                    <button
                                        on:click={() =>
                                            removeValue(
                                                queryStoreItem,
                                                queryStoreValue,
                                            )}
                                    >
                                        remove {queryStoreValue.name}
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/each}
            </div>
        {/each}
    </div>

    <h2>Search bars</h2>
    <div class="componentBox">
        <lens-search-bar-multiple noMatchesFoundMessage={"No matches found"} />
    </div>

    <h2>Search Button</h2>
    <div class="componentBox">
        <lens-search-button
            {measures}
            backendConfig={JSON.stringify(backendConfig)}
            {backendMeasures}
        />
    </div>

    <h2>Result Summary Bar</h2>
    <div class="componentBox">
        <lens-result-summary />
    </div>

    <h2>Result Table</h2>
    <div class="componentBox">
        <lens-result-table pageSize="3" title="Responding sites" />
    </div>

    <h2>Result Pie Chart</h2>
    <div class="componentBox">
        <lens-chart
            title="Gender distribution"
            catalogueGroupCode="gender"
            chartType="pie"
        />
    </div>

    <h2>Result Bar Chart</h2>
    <div class="componentBox">
        <lens-chart
            title="Alter bei Erstdiagnose"
            catalogueGroupCode="age_at_diagnosis"
            chartType="bar"
        />
    </div>

    <h2>Catalogue</h2>
    <div class="componentBox">
        <lens-catalogue
            texts={catalogueText}
            toggle={{ collapsable: true, open: catalogueopen }}
        />
    </div>

    <h2>State display</h2>
    <div class="componentBox">
        <lens-state-display />
    </div>
</main>

<lens-options options={libraryOptions} catalogueData={mockCatalogueData} />
