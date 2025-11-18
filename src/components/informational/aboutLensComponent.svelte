<svelte:options
    customElement={{
        tag: "lens-about",
    }}
/>

<script lang="ts">
    import pkg from "../../../package.json";

    let version = $state(pkg.version);
    let commit = $state("todo");

    let open: boolean = $state(false);
    let root: HTMLElement;

    function toggle() {
        open = !open;
    }

    // handle click outside
    // prevent event listeners stacking
    $effect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            const path = e.composedPath();
            if (!path.includes(root)) {
                open = false;
            }
        };
        window.addEventListener("click", onClick, { capture: true });
        return () => {
            window.removeEventListener("click", onClick, { capture: true });
        };
    });
</script>

<div part="lens-info-wrapper" bind:this={root}>
    <button part="lens-info-open" aria-label="lens-info-open" onclick={toggle}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="4 4 40 40"
        >
            <path
                d="M 24 4 C 12.972066 4 4 12.972074 4 24 C 4 35.027926 12.972066 44 24 44 C 35.027934 44 44 35.027926 44 24 C 44 12.972074 35.027934 4 24 4 z M 24 7 C 33.406615 7 41 14.593391 41 24 C 41 33.406609 33.406615 41 24 41 C 14.593385 41 7 33.406609 7 24 C 7 14.593391 14.593385 7 24 7 z M 24 14 A 2 2 0 0 0 24 18 A 2 2 0 0 0 24 14 z M 23.976562 20.978516 A 1.50015 1.50015 0 0 0 22.5 22.5 L 22.5 33.5 A 1.50015 1.50015 0 1 0 25.5 33.5 L 25.5 22.5 A 1.50015 1.50015 0 0 0 23.976562 20.978516 z"
            ></path>
        </svg>
    </button>
    <span part="lens-info-made-with">
        Made with ♥ and
        <a href="https://github.com/samply/lens">samply/lens</a>
    </span>
    {#if open}
        <div part="lens-info-popover">
            <button
                part="lens-info-close"
                aria-label="lens-info-close"
                onclick={toggle}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 -960 960 960"
                    ><path
                        d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144z"
                    /></svg
                >
            </button>

            <strong>Lens Information</strong>
            <br />
            <small><strong>Version:</strong> {version}</small><br />
            <small><strong>Commit:</strong> {commit}</small>
        </div>
    {/if}
</div>

<style>
    [part~="lens-info-wrapper"] {
        position: relative;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    [part~="lens-info-open"] {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        background: none;
        cursor: pointer;
        user-select: none;
        border: none;
        padding: 0;
    }
    [part~="lens-info-popover"] {
        position: absolute;
        bottom: 30px;
        left: 0;
        background: white;
        border: solid 1px var(--blue);
        border-radius: 6px;
        padding: 0.75rem 1rem;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
        z-index: 1000;
        min-width: 200px;
        margin: 0;
    }
    [part~="lens-info-close"] {
        position: absolute;
        top: 4px;
        right: 4px;
        cursor: pointer;
        border: none;
        width: 18px;
        background: none;
        padding: 0;
    }
</style>
