<svelte:options
    customElement={{
        tag: "lens-search-button",
    }}
/>

<script lang="ts">
    import { translate } from "../../helpers/translations";

    interface Props {
        title?: string;
        disabled?: boolean;
    }

    let { title = translate("search"), disabled = false }: Props = $props();

    const onclick = (): void => {
        window.dispatchEvent(new CustomEvent("lens-search-button-clicked"));
    };
</script>

<button part="lens-search-button" {onclick} {disabled}>
    <div part="lens-search-button-magnifying-glass">&#x26B2;</div>
    <div part="lens-search-button-title">
        {title}
    </div>
</button>

<style>
    [part~="lens-search-button"] {
        color: var(--button-color);
        border: none;
        border-radius: var(--border-radius-small);
        padding: var(--gap-xs) var(--gap-s);
        font-size: var(--font-size-m);
        cursor: pointer;
        display: flex;
        gap: var(--gap-xs);
        align-items: center;
        background-color: var(--blue);
    }
    [part~="lens-search-button"]:disabled {
        background-color: var(--gray);
    }
    [part~="lens-search-button"]:hover {
        background-color: var(--light-blue);
    }
    [part~="lens-search-button-magnifying-glass"] {
        transform: rotate(-45deg);
        font-size: var(--font-size-xl);
        line-height: 0;
    }
    [part~="lens-search-button-title"] {
        font-family: var(--font-family);
    }
</style>
