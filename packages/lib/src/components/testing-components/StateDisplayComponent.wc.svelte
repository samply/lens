<svelte:options customElement="lens-state-display" />

<script lang="ts">
    import { queryStore } from "../../stores/query";
</script>

<div>{JSON.stringify($queryStore)}</div>