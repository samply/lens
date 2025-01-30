<svelte:options
    customElement={{
        tag: "lens-negotiate-button",
    }}
/>

<script lang="ts">
    import { datarequestsStore } from "../../stores/datarequests";
    import { negotiate } from "../../services/ccpProjectManager.ts";
    import { bbmrinegotiate } from "../../services/bbmriNegotiate.ts";
  
    export let title: string = "Negotiate with biobanks";
    export let type: string;


    /**
     *
     */
    function exec(): void {
        if (type == "bbmri") {
            bbmrinegotiate($datarequestsStore);
        } else if (type == "ccp") {
            negotiate($datarequestsStore);
        }
    }
</script>

<button
    part={`lens-negotiate-button lens-negotiate-button-${
        $datarequestsStore.length === 0 ? "disabled" : "active"
    }`}
    on:click={exec}
    disabled={$datarequestsStore.length === 0}
>
    <div part="lens-negotiate-button-title">
        {title}
    </div>
</button>
