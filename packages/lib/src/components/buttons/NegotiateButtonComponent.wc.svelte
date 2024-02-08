<script lang="ts">
    import { negotiate } from "../../stores/negotiate";

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
    on:click={() => negotiate([])}
    {disabled}
>
    <div part="lens-negotiate-button-title">
        {title}
    </div>
</button>
