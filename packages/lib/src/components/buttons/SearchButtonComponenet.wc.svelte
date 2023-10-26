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
    import { queryModified, queryStore } from "../../stores/query";
    import { measureStore } from "../../stores/measures";
    import {translateAstToCql} from "../../cql-translator-service/ast-to-cql-translator";
    import { buildLibrary, buildMeasure } from "../../helpers/cql-measure";
    import { Spot } from "../../classes/spot";
    import { catalogueKeyToResponseKeyMap, uiSiteMappingsStore } from "../../stores/mappings";
    import type { Measure, BackendConfig } from "../../types/backend";
    import { responseStore } from "../../stores/response";

    export let title: string = "Search";
    export let backendConfig: BackendConfig = {
        url: "http://localhost:8080",
        backends: ['dktk-test', 'mannheim'],
        uiSiteMap: [['dktk-test', 'DKTK Test'], ['mannheim', 'Mannheim']],
        catalogueKeyToResponseKeyMap: []
    };

    export let disabled: boolean = false;
    export let measures: Measure[] = [];
    export let backendMeasures: string = "";
    let controller: AbortController;
    
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

    $: catalogueKeyToResponseKeyMap.update((mappings) => {
        backendConfig.catalogueKeyToResponseKeyMap.forEach((mapping) => {
            mappings.set(mapping[0], mapping[1]);
        })
        return mappings
    })
    
    /**
     * watches the measures for changes to populate the measureStore
    */
    $: measureStore.set(measures);

    /**
     * triggers a request to the backend via the spot class
     */
    const getResultsFromBackend = async () => {

        if (controller) {
            controller.abort();
        }
        responseStore.set(new Map());

        controller = new AbortController();

        const ast = buildAstFromQuery($queryStore);
        const cql = translateAstToCql(ast, false, backendMeasures);

        const library = buildLibrary(`${cql}`)
        const measure = buildMeasure(library.url, $measureStore.map( measureItem => measureItem.measure))
        const query = {lang: "cql", lib: library, measure: measure};



        const backend = new Spot(
            new URL(backendConfig.url),
            backendConfig.backends,
        )

        backend.send(
            btoa(decodeURI(JSON.stringify(query))),
            controller
        )

        queryModified.set(false);

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
