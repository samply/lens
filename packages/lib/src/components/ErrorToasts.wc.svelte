<svelte:options
    customElement={{
        tag: "error-toasts",
    }}
/>

<script lang="ts">
    import { run } from "svelte/legacy";

    import { fade } from "svelte/transition";
    import { errorChannel } from "../stores/error-channel";

    // Each toast has a unique id that maps to the error message
    let toasts: Map<string, string> = $state(new Map());

    /**
     * @param message user-facing error message
     */
    function showToast(message: string): void {
        const uuid = crypto.randomUUID();
        toasts.set(uuid, message);
        toasts = toasts; // update

        setTimeout(() => {
            toasts.delete(uuid);
            toasts = toasts; // update
        }, 8000);
    }

    // subscribe to error channel
    run(() => {
        if ($errorChannel !== "") {
            showToast($errorChannel);
            errorChannel.set("");
        }
    });
</script>

<div part="flex-container">
    {#each toasts as [uuid, message] (uuid)}
        <div out:fade part="toast">
            <div part="message">{message}</div>
            <button
                part="close-button"
                onclick={() => {
                    toasts.delete(uuid);
                    toasts = toasts; // update
                }}
                aria-label="Close"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    style="height: 24px; width: 24px; display: block;"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    {/each}
</div>
