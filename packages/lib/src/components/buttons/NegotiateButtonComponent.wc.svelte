<svelte:options
    customElement={{
        tag: "lens-negotiator-button"
    }}
/>


<script lang="ts">
    import { negotiate, negotiateStore } from "../../stores/negotiate";
    import { queryBase64Store } from "../../stores/query";

    export let title: string = "Negotiate with biobanks";
    let disabled: boolean = false;

    /**
     * TODO: implement negotiator connection
    */


</script>
<button
    part={`lens-negotiate-button lens-negotiate-button-${
        disabled ? "disabled" : "active"
    }`}
    on:click={() => negotiate($negotiateStore, $queryBase64Store)}
    disabled={disabled}
>
    <div part="lens-negotiate-button-title">
        {title}
    </div>
</button>
