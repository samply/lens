<svelte:options
    customElement={{
        tag: "lens-negotiate-button",
    }}
/>

<script lang="ts">
    import { datarequestsStore } from "../../stores/datarequests";
    import { negotiate } from "../../services/ccpProjectManager";
    import { bbmriNegotiate } from "../../services/bbmriNegotiate";

    interface Props {
        title?: string;
        type: string;
    }

    let { title = "Negotiate with biobanks", type }: Props = $props();

    /**
     *
     */
    function exec(): void {
        if (type == "Negotiator") {
            bbmriNegotiate($datarequestsStore);
        } else if (type == "ProjectManager") {
            negotiate($datarequestsStore);
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
