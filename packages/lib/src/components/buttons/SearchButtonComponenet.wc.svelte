<svelte:options customElement={{
    tag: "lens-search-button",
    props: {
        measures: { type: "Object" },
        disabled: { type: "Boolean" },
        backendConfig: { type: "Object" },
    }
}} />

<script lang="ts">
    import { buildAstFromQuery } from "../../helpers/ast-transformer";
    import { queryStore } from "../../stores/query";
    import { measureStore } from "../../stores/measures";
    import {translateAstToCql} from "../../cql-translator-service/ast-to-cql-translator";
    import { buildLibrary, buildMeasure } from "../../helpers/cql-measure";
    import { Spot } from "../../classes/spot";
    import { uiSiteMappingsStore } from "../../stores/mappings";
    import type { Measure, BackendConfig } from "../../types/backend";

  
    export let title: string = "Search";
    export let backendConfig: BackendConfig = {
        url: "http://localhost:8080",
        backends: ['dktk-test', 'mannheim'],
        uiSiteMap: [['dktk-test', 'DKTK Test'], ['mannheim', 'Mannheim']],
    };

    export let disabled: boolean = false;
    export let measures: Measure[] = [];
    
    /**
     * watches the backendConfig for changes to populate the uiSiteMappingsStore with a map
     * web components' props are json, meaning that Maps are not supported
     * therefore it's a 2d array of strings which is converted to a map
    */
    $: uiSiteMappingsStore.update((mappings) => {
        backendConfig.uiSiteMap.forEach((site) => {
            mappings.set(site[0], site[1]);
        })
        return mappings
    })
    
    /**
     * watches the measures for changes to populate the measureStore
    */
    $: measureStore.set(measures);
   

    const cqlMock = `library Retrieve
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
true`;



    /**
     * triggers a request to the backend via the spot class
     */
    const getResultsFromBackend = async () => {
        const ast = buildAstFromQuery($queryStore);
        const cql = translateAstToCql(ast);

        const library = buildLibrary(cqlMock)
        const measure = buildMeasure(library.url, $measureStore.map( measureItem => measureItem.measure))
        const query = {lang: "cql", lib: library, measure: measure};

        const spot = new Spot(
            new URL(backendConfig.url),
            backendConfig.backends,
        )

        spot.send(
            btoa(decodeURI(JSON.stringify(query)))
        )

    };

</script>

<button
    part={`lens-search-button lens-search-button-${
        disabled ? "disabled" : "active"
    }`}
    on:click={getResultsFromBackend}
    {disabled}
>
    <div part="lens-search-button-magnifying-glass">&#x26B2;</div>
    <div part="lens-search-button-title">
        {title}
    </div>
</button>
