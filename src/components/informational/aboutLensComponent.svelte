<svelte:options
    customElement={{
        tag: "lens-about",
    }}
/>

<script lang="ts">
    import pkg from "../../../package.json";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";

    let version = $state(pkg.version);

    let open: boolean = $state(false);
    let root: HTMLElement;

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
    <InfoButtonComponent
        message={["About Lens", "Lens Version: " + { version }]}
        buttonSize="20px"
        alignDialogue="top"
        dialogueMaxWidth="250px"
    ></InfoButtonComponent>
    <span part="lens-info-made-with">
        Made with ♥ and
        <a href="https://github.com/samply/lens">samply/lens</a>
    </span>
</div>

<style>
    [part~="lens-info-wrapper"] {
        position: relative;
        display: flex;
        align-items: center;
        gap: 5px;
    }
</style>
