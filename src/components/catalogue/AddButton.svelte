<script lang="ts">
    import { CirclePlus, CircleMinus } from "lucide-svelte";

    interface Props {
        negated: boolean;
        onclick: () => void;
    }

    let { negated, onclick }: Props = $props();
</script>

{#if !negated}
    <button
        type="button"
        aria-label="Add to query"
        class="text-primary-500 hover:text-primary-700 cursor-pointer bg-transparent border-none p-0"
        {onclick}
    >
        <CirclePlus size={22} />
    </button>
{:else}
    <button
        type="button"
        aria-label="Add negated filter"
        class="text-danger-500 hover:text-danger-700 cursor-pointer bg-transparent border-none p-0"
        {onclick}
    >
        <CircleMinus size={22} />
    </button>
{/if}
