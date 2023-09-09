<svelte:options
    customElement={{
        tag: "lens-result-summary",
        props: {
            resultSummaryDataTypes: { type: "Array" },
        },
    }}
/>

<script lang="ts">
    import { responseStore } from "../../stores/response";

    export let title: string = "";
    export let resultSummaryDataTypes: string[] = [];
    export let negotiateButton: boolean = false;
    export let negotiateButtonText: string = "Negotiate";

    /**
     * TODO: check which reuslt summary data types are available in the response
     * and only display those
     * 
     * TODO: create negotiate button component
     */

</script>

{#if title}
    <div part="result-summary-header">
        <h4 part="result-summary-header-title">
            {title}
        </h4>
    </div>
{/if}
<div part="result-summary-content">
    {#each resultSummaryDataTypes as type}
        <div part="result-summary-content-type">
            {type}: 0
        </div>
    {/each}
</div>
{#if negotiateButton}
    <div part="result-summary-footer">
        <button part="result-summary-footer-button">
            {negotiateButtonText}
        </button>
    </div>
{/if}