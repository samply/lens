<svelte:options customElement="lens-state-display" />

<script lang="ts">
    import { buildAstFromQuery } from "../../helpers/ast-transformer";
    import { queryStore } from "../../stores/query";
    import { translateAstToCql } from "../../cql-translator-service/ast-to-cql-translator";
    import { measureStore } from "../../stores/measures";
</script>

{#if $queryStore[0].length > 0}
    {translateAstToCql(
        buildAstFromQuery($queryStore),
        false,
        "DKTK_STRAT_DEF_IN_INITIAL_POPULATION",
        $measureStore[0]?.measures,
    )}
{/if}
<hr />
<pre>{@html JSON.stringify($queryStore, null, 2)}</pre>
<hr />
{#if $queryStore[0].length > 0}
    <pre>{@html JSON.stringify(buildAstFromQuery($queryStore), null, 2)}</pre>
{/if}
