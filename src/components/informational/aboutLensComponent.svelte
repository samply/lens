<svelte:options
    customElement={{
        tag: "lens-about",
    }}
/>

<script lang="ts">
    import pkg from "../../../package.json";

    let showPopup = $state(false);
    let version = $state(pkg.version);
    let commit = $state("todo");

    function toggle() {
        showPopup = !showPopup;
    }
</script>

<div class="wrapper">
    <span class="info-icon" onclick={toggle}>i</span>
    <span>
        Made with ♥ and
        <a href="https://github.com/samply/lens">samply/lens</a>
    </span>
    {#if showPopup}
        <div class="popover" onclick={(e) => e.stopPropagation()}>
            <span class="close-x" onclick={toggle}>×</span>

            <strong>Lens Information</strong>
            <br />
            <small><strong>Version:</strong> {version}</small><br />
            <small><strong>Commit:</strong> {commit}</small>
        </div>
    {/if}
</div>

<style>
    .info-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #eee;
        color: #333;
        font-size: 12px;
        font-weight: bold;
        margin-left: 6px;
        cursor: pointer;
        user-select: none;
    }

    .popover {
        position: absolute;
        top: -10px; /* pushes it above the trigger */
        left: 0;
        transform: translateY(-100%);
        background: white;
        border: 1px solid #ccc;
        border-radius: 6px;
        padding: 0.75rem 1rem;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
        z-index: 1000;
        min-width: 200px;
    }

    .close-x {
        position: absolute;
        top: 4px;
        right: 6px;
        cursor: pointer;
        font-size: 14px;
        color: #666;
    }

    .wrapper {
        position: relative;
        display: inline-block;
    }
</style>
