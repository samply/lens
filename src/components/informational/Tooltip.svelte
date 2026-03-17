<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        /** The tooltip message to display */
        message: string | string[];
        /** Child content that triggers the tooltip on hover */
        children: Snippet;
    }

    let { message, children }: Props = $props();

    let showTooltip = $state(false);
</script>

<span
    part="lens-tooltip-trigger"
    class="relative inline-flex items-center gap-0.5"
    role="group"
    onmouseenter={() => (showTooltip = true)}
    onmouseleave={() => (showTooltip = false)}
>
    {@render children()}
    {#if showTooltip}
        <span
            part="lens-tooltip"
            role="tooltip"
            class="pointer-events-none absolute bottom-full left-1/2 z-1000 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-primary-900 px-2 py-1 text-xs text-white"
        >
            <span part="lens-tooltip-message" class="block text-left">
                {#if typeof message === "string"}
                    {message}
                {:else}
                    {#each message as line, index (line + index)}
                        <span class="block">{line}</span>
                    {/each}
                {/if}
            </span>
            <span
                part="lens-tooltip-arrow"
                class="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-primary-900"
            ></span>
        </span>
    {/if}
</span>
