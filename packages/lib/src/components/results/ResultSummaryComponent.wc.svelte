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
    import NegotiateButtonComponent from "../buttons/NegotiateButtonComponent.wc.svelte";

    export let title: string = "";
    export let resultSummaryDataTypes: string[] = [];
    export let negotiateButton: boolean = false;
    export let negotiateButtonText: string = "Negotiate";

    /**
     * TODO: check which reuslt summary data types are available in the response
     * and only display those
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
       <NegotiateButtonComponent title={negotiateButtonText} />
    </div>
{/if}