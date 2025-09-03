<svelte:options
    customElement={{
        tag: "lens-query-spinner",
    }}
/>

<script lang="ts">
    import { siteStatus } from "../../stores/response";

    let { size = "20px" } = $props();

    let loading = $derived.by(() =>
        Array.from($siteStatus.values()).some((status) => status === "claimed"),
    );
</script>

<div
    class="spinner"
    style="--size: {size}; visibility: {loading ? 'visible' : 'hidden'};"
></div>

<style>
    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: var(--size);
        height: var(--size);
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
