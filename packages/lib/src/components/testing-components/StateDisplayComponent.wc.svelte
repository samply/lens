<svelte:options customElement="lens-state-display" />

<script lang="ts">
    import { queryStore } from "../../stores/query";
</script>

<pre>{@html JSON.stringify($queryStore, null, 2)}</pre>