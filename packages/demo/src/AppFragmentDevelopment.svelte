<script lang="ts">
    import type {
        CatalogueText,
        MeasureItem,
        Measure,
        QueryEvent,
        QueryItem,
        QueryValue,
        LensDataPasser,
    } from "../../../dist/types";

    import {
        dktkDiagnosisMeasure,
        dktkMedicationStatementsMeasure,
        dktkPatientsMeasure,
        dktkProceduresMeasure,
        dktkSpecimenMeasure,
        dktkHistologyMeasure,
    } from "./measures";

    import { buildLibrary } from "./backends/cql-measure";
    import { translateAstToCql } from "./backends/ast-to-cql-translator";
    import { buildMeasure } from "./backends/cql-measure";
    import { Spot } from "./backends/spot";

    let catalogueData = "";
    let libraryOptions = "";

    fetch("catalogues/catalogue-dktk.json")
        .then((response) => response.text())
        .then((data) => {
            catalogueData = data;
        });

    fetch("options-dev.json")
        .then((response) => response.json())
        .then((data) => {
            libraryOptions = data;
        });

    const measures = [
        {
            name: "DKTK",
            measures: [
                dktkPatientsMeasure,
                dktkDiagnosisMeasure,
                dktkSpecimenMeasure,
                dktkProceduresMeasure,
                dktkMedicationStatementsMeasure,
                dktkHistologyMeasure,
            ],
        },
    ];

    /**
     * move to config file
     */
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

    let queryStore: QueryItem[][] = [];

    let dataPasser: LensDataPasser;

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

    window.addEventListener("emit-lens-query", (e) => {
        const event = e as QueryEvent;
        const { ast, updateResponse, abortController } = event.detail;

        const measureItems: MeasureItem[] = [
            dktkPatientsMeasure,
            dktkDiagnosisMeasure,
            dktkSpecimenMeasure,
            dktkProceduresMeasure,
            dktkMedicationStatementsMeasure,
            dktkHistologyMeasure,
        ] as MeasureItem[];

        const measures: Measure[] = measureItems.map(
            (measureItem: MeasureItem) => measureItem.measure,
        );

        const criteria = dataPasser.getCriteriaAPI("diagnosis");

        console.log("app cql translation", measureItems);
        const cql = translateAstToCql(
            ast,
            false,
            "DKTK_STRAT_DEF_IN_INITIAL_POPULATION",
            measureItems,
            criteria,
        );
        console.log("app build meausre", measures);

        const library = buildLibrary(`${cql}`);
        const measure = buildMeasure(library.url, measures);
        const query = { lang: "cql", lib: library, measure: measure };

        const backend = new Spot(new URL("http://localhost:8055"), [
            "berlin",
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
            "hamburg",
        ]);

        backend.send(
            btoa(decodeURI(JSON.stringify(query))),
            updateResponse,
            abortController,
        );
    });
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
        <lens-search-button />
    </div>

    <h2>Result Summary Bar</h2>
    <div class="componentBox">
        <lens-result-summary />
    </div>

    <h2>Result Table</h2>
    <div class="componentBox">
        <lens-result-table pageSize="10" title="Responding sites" />
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

<lens-options options={libraryOptions} {catalogueData} {measures} />
<lens-data-passer bind:this={dataPasser} />
