<svelte:options
    customElement={{
        tag: "lens-search-button",
        extend: withTailwind,
    }}
/>

<script lang="ts">
    import { Search } from "lucide-svelte";
    import { withTailwind } from "../../helpers/tailwind";
    import { translate } from "../../helpers/translations";
    import { queryModified, queryStore } from "../../stores/query";
    import {siteStatus} from "../../stores/response";

     let loading = $derived.by(() =>
        Array.from($siteStatus.values()).some((status) => status === "claimed"),
    );

    interface Props {
        title?: string;
        disabled?: boolean;
    }

    let { title = translate("search"), disabled = false }: Props = $props();

    function onclick(): void {
        queryModified.set(false);
        $queryStore = $queryStore.filter((queryGroup) => queryGroup.length > 0);
        if ($queryStore.length === 0) {
            $queryStore = [[]];
        }
        window.dispatchEvent(new CustomEvent("lens-search-triggered"));
    }
</script>

<button
    part="lens-search-button"
    class="bg-primary-500 text-white border-none rounded px-5 py-2.5
           text-base cursor-pointer flex gap-2.5 items-center font-sans
           hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
    {onclick}
    {disabled}
>
{#if loading}
     <lens-query-spinner></lens-query-spinner>
{:else}
     <Search class="size-5" />
{/if}
    
    {title}
</button>
