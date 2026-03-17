<script lang="ts">
    import { Plus, Minus } from "lucide-svelte";

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
        class="m-0.5 inline-flex size-6 items-center justify-center rounded-full bg-primary-500 hover:bg-primary-400 text-white"
        {onclick}
    >
        <Plus size={12} />
    </button>
{:else}
    <button
        type="button"
        aria-label="Add negated filter"
        class="m-0.5 inline-flex size-6 items-center justify-center rounded-full bg-danger-500 hover:bg-danger-400 text-white"
        {onclick}
    >
        <Minus size={12} />
    </button>
{/if}
