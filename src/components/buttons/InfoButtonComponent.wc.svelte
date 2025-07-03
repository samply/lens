<svelte:options
    customElement={{
        tag: "lens-info-button",
    }}
/>

<script lang="ts">
    import { lensOptions } from "../../stores/options";

    interface Props {
        message?: string[] | string;
    }

    let { message = $bindable([]) }: Props = $props();

    /**
     * handles the toggling of the tooltip
     */
    let tooltipOpen: boolean = $state(false);

    const onFocusOut = (): void => {
        tooltipOpen = false;
    };

    const displayQueryInfo = (e: MouseEvent): void => {
        if (typeof message == "string") {
            message = message.split(",");
        }

        const target: HTMLElement = e.target as HTMLElement;
        if (
            target.getAttribute("part") !== "info-button-dialogue" &&
            target.getAttribute("part") !== "info-button-dialogue-message"
        ) {
            tooltipOpen = !tooltipOpen;
        }
    };
</script>

<button
    part="info-button"
    onclick={(e) => displayQueryInfo(e)}
    onfocusout={onFocusOut}
>
    {#if $lensOptions?.iconOptions?.infoUrl}
        <img
            part="info-button-icon"
            src={$lensOptions?.iconOptions?.infoUrl}
            alt="info icon"
        />
    {:else}
        <span part="info-button-icon"> &#9432; </span>
    {/if}
    {#if tooltipOpen}
        <div part="info-button-dialogue" style="user-select: text;">
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each message as msg}
                <div
                    part="info-button-dialogue-message"
                    style="user-select: text;"
                >
                    {msg}
                </div>
            {/each}
        </div>
    {/if}
</button>

<style>
    [part~="info-button"] {
        position: relative;
        cursor: pointer;
        width: 38px;
        background-color: var(--white);
        border: solid 1px var(--blue);
        border-radius: var(--border-radius-small);
    }

    [part~="info-button-dialogue"] {
        cursor: auto;
        position: absolute;
        border: none;
        background-color: var(--white);
        width: max-content;
        max-width: 80vw;
        z-index: 100;
        padding: var(--gap-s);
        top: 40px;
        right: 0px;
        border: solid 1px var(--blue);
        border-radius: var(--border-radius-small);
    }
</style>
