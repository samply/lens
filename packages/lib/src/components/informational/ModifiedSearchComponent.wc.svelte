<svelte:options
    customElement={{
        tag: "lens-search-modified-display",
    }}
/>

<script lang="ts">
    import { queryModified } from "../../stores/query";
    console.log('asdf');
    $: console.log($queryModified);
</script>

{#if $queryModified}
<div part='display-wrapper'>
    <slot></slot>
</div>
{/if}
