<svelte:options
    customElement={{
        tag: "error-toasts",
    }}
/>

<script lang="ts">
    import { errorChannel } from "../stores/error-channel";

    let toasts = [];

    /**
     * @param message user-facing error message
     */
    function showToast(message: string): void {
        toasts.push(message);
        toasts = toasts; // update

        setTimeout(() => {
            toasts.shift();
            toasts = toasts; // update
        }, 8000);
    }

    // subscribe to error channel
    $: if ($errorChannel) {
        showToast($errorChannel);
        errorChannel.set(null);
    }
</script>

<div part="flex-container">
    {#each toasts as toast}
        <div part="toast">{toast}</div>
    {/each}
</div>
