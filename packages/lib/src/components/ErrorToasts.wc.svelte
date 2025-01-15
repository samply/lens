<svelte:options
    customElement={{
        tag: "error-toasts",
    }}
/>

<script lang="ts">
    import { fade } from "svelte/transition";
    import { errorChannel } from "../stores/error-channel";

    let toasts: { uuid: string; message: string }[] = [];

    /**
     * @param message user-facing error message
     */
    function showToast(message: string): void {
        toasts.push({ uuid: crypto.randomUUID(), message });
        toasts = toasts; // update

        setTimeout(() => {
            toasts.shift();
            toasts = toasts; // update
        }, 8000);
    }

    // subscribe to error channel
    $: if ($errorChannel) {
        showToast($errorChannel);
        errorChannel.set("");
    }
</script>

<div part="flex-container">
    {#each toasts as toast (toast.uuid)}
        <div out:fade part="toast">{toast.message}</div>
    {/each}
</div>
