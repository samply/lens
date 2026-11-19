<svelte:options
    customElement={{
        tag: "lens-study-filter",
        extend: withTailwind,
    }}
/>

<script lang="ts" module>
    import type { Catalogue } from "../../types/catalogue";

    let baseCatalogue: Catalogue | null = null;
</script>

<script lang="ts">
    import { Check, Filter, Plus } from "lucide-svelte";
    import { withTailwind } from "../../helpers/tailwind";
    import { translate } from "../../helpers/translations";
    import { getCatalogue, setCatalogue } from "../../stores/catalogue";
    import { filterCatalogue } from "./catalogue-transform";
    import {
        countDataElements,
        countDataElementsOfStudy,
        getSelectedStudies,
        getStudyColor,
        selectAllStudies,
        studyState,
        toggleStudy,
    } from "./study-state.svelte";

    if (baseCatalogue === null) {
        baseCatalogue = getCatalogue();
    }
    const fullCatalogue: Catalogue = baseCatalogue;

    const totalCount = countDataElements(fullCatalogue);

    let studies = $derived(
        studyState.studies.map((name, index) => ({
            name,
            index,
            alias: studyState.alias[index],
            color: getStudyColor(index),
            active: studyState.activeButton[index] === true,
            count: countDataElementsOfStudy(fullCatalogue, name),
        })),
    );

    let allActive = $derived(studies.every((study) => study.active));

    let shownCount = $derived(
        countDataElements(
            filterCatalogue(
                fullCatalogue,
                studies.filter((s) => s.active).map((s) => s.name),
            ),
        ),
    );

    function applyFilter(): void {
        setCatalogue(filterCatalogue(fullCatalogue, getSelectedStudies()));
    }

    function onToggle(index: number): void {
        toggleStudy(index);
        applyFilter();
    }

    function onShowAll(): void {
        selectAllStudies();
        applyFilter();
    }

    function toggleTitle(study: string): string {
        return translate("study_filter_toggle_title").replace("{study}", study);
    }

    function showingText(): string {
        return translate("study_filter_showing")
            .replace("{shown}", String(shownCount))
            .replace("{total}", String(totalCount));
    }
</script>

{#snippet badge(alias: string, color: string, active: boolean)}
    <span
        part="lens-study-filter-badge"
        class="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white transition-colors"
        style="background-color: {active ? color : '#a3a9b3'}">{alias}</span
    >
{/snippet}

{#snippet header()}
    <div
        part="lens-study-filter-header"
        class="flex flex-wrap items-center justify-between gap-2"
    >
        <span
            part="lens-study-filter-title"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-900"
        >
            <Filter size={15} class="text-primary-600" />
            {translate("study_filter_title")}
        </span>
        <span
            part="lens-study-filter-summary"
            class="inline-flex items-center gap-2 text-xs text-primary-800/70"
        >
            {showingText()}
            {#if !allActive}
                <button
                    part="lens-study-filter-show-all"
                    class="cursor-pointer rounded-md px-1.5 py-0.5 font-medium text-primary-600 underline-offset-2 hover:bg-primary-50 hover:underline"
                    onclick={onShowAll}
                >
                    {translate("study_filter_show_all")}
                </button>
            {/if}
        </span>
    </div>
{/snippet}

<div part="lens-study-filter" class="flex flex-col gap-3 font-[inherit]">
    {@render header()}
    <div
        part="lens-study-filter-chips"
        class="flex flex-wrap gap-2"
        role="group"
        aria-label={translate("study_filter_title")}
    >
        {#each studies as study (study.name)}
            <button
                part="lens-study-filter-chip {study.active
                    ? 'lens-study-filter-chip-active'
                    : ''}"
                class={[
                    "group inline-flex cursor-pointer items-center gap-2 rounded-full border-2 py-1 pl-1 pr-3 text-sm font-medium shadow-sm transition-all",
                    "hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 active:translate-y-0",
                    study.active
                        ? "border-[var(--study)] bg-[color-mix(in_oklab,var(--study)_12%,white)] text-[color-mix(in_oklab,var(--study)_75%,black)]"
                        : "border-dashed border-primary-200 bg-white text-primary-900/50 hover:border-[var(--study)] hover:text-primary-900/80",
                ]}
                style="--study: {study.color}"
                aria-pressed={study.active}
                title={toggleTitle(study.name)}
                onclick={() => onToggle(study.index)}
            >
                {@render badge(study.alias, study.color, study.active)}
                <span class={study.active ? "" : "line-through"}
                    >{study.name}</span
                >
                <span
                    part="lens-study-filter-chip-count"
                    class="rounded-full bg-white/70 px-1.5 text-xs tabular-nums"
                    >{study.count}</span
                >
                {#if study.active}
                    <Check size={14} strokeWidth={3} />
                {:else}
                    <Plus size={14} strokeWidth={3} />
                {/if}
            </button>
        {/each}
    </div>
</div>
