<svelte:options customElement="lens-state-display" />

<script lang="ts">
    import { buildAstFromQuery } from "../../helpers/ast-transformer";
    import { queryStore } from "../../stores/query";
</script>

<pre>{@html JSON.stringify($queryStore, null, 2)}</pre>
<hr>
{#if $queryStore[0].length > 0}
    <pre>{@html JSON.stringify(buildAstFromQuery($queryStore), null, 2)}</pre>
{/if}