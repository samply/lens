<svelte:options
    customElement={{
        tag: "lens-negotiate-button",
    }}
/>

<script lang="ts">
    import { datarequestsStore } from "../../stores/datarequests";
    import { bbmriNegotiate } from "../../services/bbmriNegotiate";

    interface Props {
        title?: string;
        type?: string;
    }

    let { title = "Request Data", type }: Props = $props();

    /**
     *
     */
    function exec(): void {
        window.dispatchEvent(new CustomEvent("lens-negotiate-triggered"));
        if (type == "Negotiator") {
            bbmriNegotiate($datarequestsStore);
        }
    }
</script>

<button
    part={`lens-negotiate-button lens-negotiate-button-${
        $datarequestsStore.length === 0 ? "disabled" : "active"
    }`}
    onclick={exec}
    disabled={$datarequestsStore.length === 0}
>
    <div part="lens-negotiate-button-title">
        {title}
    </div>
</button>

<style>
    [part~="lens-negotiate-button"] {
        color: var(--white);
        border: none;
        border-radius: var(--border-radius-small);
        padding: var(--gap-xs) var(--gap-s);
        font-size: var(--font-size-m);
        cursor: pointer;
        display: flex;
        gap: var(--gap-xs);
        align-items: center;
        font-family: var(--font-family);
    }

    [part~="lens-negotiate-button-active"] {
        background-color: var(--blue);
    }

    [part~="lens-negotiate-button-disabled"] {
        background-color: var(--gray);
    }

    [part~="lens-negotiate-button-active"]:hover {
        background-color: var(--light-blue);
    }

    [part~="lens-negotiate-button-title"] {
        font-size: medium;
    }
</style>
