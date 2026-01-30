<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        /** The tooltip message to display */
        message: string;
        /** Child content that triggers the tooltip on hover */
        children: Snippet;
    }

    let {
        message,
        children,
    }: Props = $props();

    let showTooltip = $state(false);
</script>

<span
    part="lens-tooltip-trigger"
    role="group"
    onmouseenter={() => (showTooltip = true)}
    onmouseleave={() => (showTooltip = false)}
>
    <span part="lens-tooltip-icon {showTooltip ? 'lens-tooltip-icon-active' : ''}" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"/></svg>
    </span>
    {@render children()}
    {#if showTooltip}
        <span part="lens-tooltip" role="tooltip">
            <span part="lens-tooltip-message">{message}</span>
            <span part="lens-tooltip-arrow"></span>
        </span>
    {/if}
</span>

<style>
    [part~="lens-tooltip-trigger"] {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--gap-xxs, 2px);
    }

    [part~="lens-tooltip"] {
        position: absolute;
        background-color: var(--dark-blue, #1a365d);
        color: var(--white, #fff);
        padding: var(--gap-xs, 4px) var(--gap-s, 8px);
        border-radius: var(--border-radius-small, 4px);
        font-size: var(--font-size-s, 0.875rem);
        font-family: var(--font-family, sans-serif);
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: var(--gap-xs, 8px);
    }

    [part~="lens-tooltip-arrow"] {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 6px;
        border-style: solid;
        border-color: var(--dark-blue, #1a365d) transparent transparent transparent;
    }

    [part~="lens-tooltip-icon"] {
        display: inline-flex;
        align-items: center;
        color: var(--gray, #6c757d);
        line-height: 1;
    }

    [part~="lens-tooltip-icon-active"] {
        color: var(--blue, #0d6efd);
    }

    [part~="lens-tooltip-icon"] svg {
        width: 0.7em;
        height: 0.7em;
    }
</style>
