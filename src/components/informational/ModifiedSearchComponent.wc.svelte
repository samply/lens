<svelte:options
    customElement={{
        tag: "lens-search-modified-display",
    }}
/>

<script lang="ts">
    import { queryModified } from "../../stores/query";
</script>

{#if $queryModified}
    <div part="lens-query-modified-display-wrapper">
        <slot></slot>
    </div>
{/if}

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
