<svelte:options
    customElement={{
        tag: "lens-search-modified-display",
    }}
/>

<script lang="ts">
    import { queryModified } from "../../stores/query";
</script>

{#if $queryModified}
<div part='display-wrapper'>
    <slot></slot>
</div>
{/if}
