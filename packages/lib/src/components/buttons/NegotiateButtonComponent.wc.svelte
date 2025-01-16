<svelte:options
    customElement={{
        tag: "lens-negotiate-button",
    }}
/>

<script lang="ts">
    import { datarequestsStore } from "../../stores/datarequests";
    import { negotiate } from "../../services/bbmriNegotiate";

    export let title: string = "Negotiate with biobanks";
</script>

<button
    part={`lens-negotiate-button lens-negotiate-button-${
        $datarequestsStore.length === 0 ? "disabled" : "active"
    }`}
    on:click={() => negotiate($datarequestsStore)}
    disabled={$datarequestsStore.length === 0}
>
    <div part="lens-negotiate-button-title">
        {title}
    </div>
</button>
