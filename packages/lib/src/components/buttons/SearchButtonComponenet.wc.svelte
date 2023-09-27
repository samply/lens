<svelte:options customElement={{
    tag: "lens-search-button",
    props: {
        measures: { type: "Object" },
        disabled: { type: "Boolean" },
    }
}} />

<script lang="ts">

    

    // import { translateAstToCql } from "../../cql-translator-service/ast-to-cql-translator";
    import { buildAstFromQuery } from "../../helpers/ast-transformer";
    import { queryStore } from "../../stores/query";
    import { measureStore } from "../../stores/measures";
    import { responseStore } from "../../stores/response";
    import {translateAstToCql} from "../../cql-translator-service/ast-to-cql-translator";
    import type { Measure } from "../../types/Measure";


    export let title: string = "Search";
    export let backendUrl: string = "";
    export let disabled: boolean = false;
    export let measures: Measure[] = [];

    $measureStore = measures;


    /**
     * TODO: send query to backend and process response
     */
    const getResultsFromBiobanks = async () => {
        const ast = buildAstFromQuery($queryStore);
        const cql = translateAstToCql(ast);
    };
</script>

<button
    part={`lens-search-button lens-search-button-${
        disabled ? "disabled" : "active"
    }`}
    on:click={getResultsFromBiobanks}
    {disabled}
>
    <div part="lens-search-button-magnifying-glass">&#x26B2;</div>
    <div part="lens-search-button-title">
        {title}
    </div>
</button>
