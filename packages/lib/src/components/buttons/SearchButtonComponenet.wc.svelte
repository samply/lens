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
    import { Blaze } from "../../classes/blaze";
    import { queryStore } from "../../stores/query";
    import { measureStore } from "../../stores/measures";
    import { responseStore } from "../../stores/response";
    import {translateAstToCql} from "../../cql-translator-service/ast-to-cql-translator";
    import type { Measure } from "../../types/measure";


    export let title: string = "Search";
    export let backendUrl: string = "";
    export let disabled: boolean = false;
    export let measures: Measure[] = [];

    $: measureStore.set(measures);

    const getResultsFromBiobanks = async () => {
        const ast = buildAstFromQuery($queryStore);
        const cql = translateAstToCql(ast);

        const blaze = new Blaze(
            new URL('http://localhost:8080/fhir')
        )

        const response = await blaze.send(cql);



        responseStore.update((store) => {
            store.set('blaze', {status: 'finito', data: response});
            return store;
        });


    };

    $: $responseStore.forEach((value: any, key: string) => {
        console.log(value, key);
        
    });

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
