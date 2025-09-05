<svelte:options
    customElement={{
        tag: "lens-search-modified-display",
    }}
/>

<script lang="ts">
    import { translate } from "../../helpers/translations";
    import { queryModified } from "../../stores/query";
</script>

<div
    part="lens-query-modified-display-wrapper"
    style="visibility: {$queryModified ? 'visible' : 'hidden'}"
>
    <slot>
        {translate("query_modified")}
    </slot>
</div>

<style>
    [part~="lens-query-modified-display-wrapper"] {
        border: solid var(--light-orange) 1px;
        border-radius: var(--border-radius-small);
        padding: var(--gap-xxs) var(--gap-xs);
        text-align: center;
        width: max-content;
        margin: var(--gap-xs) auto;
    }
</style>
