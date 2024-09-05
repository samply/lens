<svelte:options
    customElement={{
        tag: "lens-negotiate-button",
    }}
/>

<script lang="ts">
    import { negotiate, negotiateStore } from "../../stores/negotiate";

    export let title: string = "Negotiate with biobanks";
    let disabled: boolean = false;
</script>

<button
    part={`lens-negotiate-button lens-negotiate-button-${
        disabled ? "disabled" : "active"
    }`}
    on:click={() => negotiate($negotiateStore)}
    {disabled}
>
    <div part="lens-negotiate-button-title">
        {title}
    </div>
</button>
