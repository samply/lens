<svelte:options
    customElement={{
        tag: "lens-negotiate-button",
    }}
/>

<script lang="ts">
    import { negotiate, negotiateStore } from "../../stores/negotiate";

    export let title: string = "Negotiate with biobanks";
</script>

<button
    part={`lens-negotiate-button lens-negotiate-button-${
        $negotiateStore.length === 0 ? "disabled" : "active"
    }`}
    on:click={() => negotiate($negotiateStore)}
    disabled={$negotiateStore.length === 0}
>
    <div part="lens-negotiate-button-title">
        {title}
    </div>
</button>
