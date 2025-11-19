<svelte:options
    customElement={{
        tag: "lens-about",
    }}
/>

<script lang="ts">
    import pkg from "../../../package.json";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";

    let version = $state(pkg.version);
</script>

<div part="lens-info-wrapper">
    <InfoButtonComponent
        buttonSize={20}
        alignDialogue="top-right"
        dialogueMaxWidth="250px"
    >
        <h4 part="lens-info-header">Ablut Lens</h4>
        <div part="lens-info-body">Lens Version: {version}</div>
    </InfoButtonComponent>
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

    [part~="lens-info-header"] {
        margin-top: 0;
        margin-bottom: var(--gap-xxs);
    }
</style>
