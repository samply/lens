<svelte:options
    customElement={{
        tag: "lens-query-explain-button",
    }}
/>

<script lang="ts">
    import { translate } from "../../helpers/translations";
    import { catalogue, getCategoryFromKey } from "../../stores/catalogue";
    import {
        queryStore,
        queryModified,
        setQueryStore,
    } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import type {
        AutocompleteCategory,
        NumericRangeCategory,
        DateRangeCategory,
        StringCategory,
    } from "../../types/catalogue";
    import InfoButtonComponent from "./InfoButtonComponent.wc.svelte";
    import AutoCompleteComponent from "../catalogue/AutoCompleteComponent.svelte";
    import NumberInputComponent from "../catalogue/NumberInputComponent.svelte";
    import DatePickerComponent from "../catalogue/DatePickerComponent.svelte";
    import StringInputComponent from "../catalogue/StringInputComponent.svelte";

    interface Props {
        noQueryMessage?: string;
        queryItemName?: string | undefined;
        queryItemValue?: QueryValue | undefined;
    }

    let {
        queryItemName = undefined,
        queryItemValue = undefined,
        noQueryMessage = "Search for all results",
    }: Props = $props();

    let dialogEl: HTMLDialogElement | undefined = $state();
    let editQuery: QueryItem[][] = $state([]);
    let editingValue: {
        groupIdx: number;
        itemIdx: number;
        valueIdx: number;
    } | null = $state(null);
    let dragState: { groupIdx: number; itemIdx: number } | null = $state(null);
    let dragOverGroup: number | null = $state(null);
    let infoOpen = $state(false);

    function valueType(
        v: QueryValue,
    ): "string" | "numeric-range" | "date-range" | "aggregated" {
        if (Array.isArray(v.value)) return "aggregated";
        if (typeof v.value === "string") return "string";
        const rv = v.value as { min?: unknown; max?: unknown };
        if (typeof rv.min === "number" || typeof rv.max === "number")
            return "numeric-range";
        return "date-range";
    }

    function openModal() {
        editQuery = structuredClone($queryStore);
        editingValue = null;
        dialogEl?.showModal();
    }

    function saveQuery() {
        if (editingValue !== null) return;
        setQueryStore($state.snapshot(editQuery) as QueryItem[][]);
        queryModified.set(true);
        dialogEl?.close();
    }

    function cancelEdit() {
        dialogEl?.close();
    }

    function onPillValueSelected(
        gi: number,
        ii: number,
        vi: number,
        newItem: QueryItem,
    ) {
        const newValue = newItem.values[0];
        if (!newValue) return;
        const isDuplicate = editQuery[gi][ii].values.some(
            (v, idx) => idx !== vi && v.name === newValue.name,
        );
        if (isDuplicate) return;
        editQuery[gi][ii].values[vi] = newValue;
        editQuery = editQuery;
        editingValue = null;
    }

    function removeGroup(gi: number) {
        editQuery = editQuery.filter((_, i) => i !== gi);
    }

    function removeItem(gi: number, ii: number) {
        editQuery[gi] = editQuery[gi].filter((_, i) => i !== ii);
        if (editQuery[gi].length === 0)
            editQuery = editQuery.filter((_, i) => i !== gi);
        else editQuery = editQuery;
    }

    function removeValue(gi: number, ii: number, vi: number) {
        editQuery[gi][ii].values = editQuery[gi][ii].values.filter(
            (_, i) => i !== vi,
        );
        if (editQuery[gi][ii].values.length === 0) removeItem(gi, ii);
        else editQuery = editQuery;
    }

    function onDragStart(gi: number, ii: number) {
        dragState = { groupIdx: gi, itemIdx: ii };
    }

    function onDragOver(e: DragEvent, gi: number) {
        e.preventDefault();
        dragOverGroup = gi;
    }

    function onDragLeave(e: DragEvent, gi: number) {
        if (dragOverGroup === gi) dragOverGroup = null;
    }

    function onDrop(e: DragEvent, targetGi: number) {
        e.preventDefault();
        if (!dragState || dragState.groupIdx === targetGi) {
            dragState = null;
            dragOverGroup = null;
            return;
        }
        const { groupIdx: srcGi, itemIdx: srcIi } = dragState;
        const item = editQuery[srcGi][srcIi];
        editQuery[targetGi] = [...editQuery[targetGi], item];
        editQuery[srcGi] = editQuery[srcGi].filter((_, i) => i !== srcIi);
        if (editQuery[srcGi].length === 0)
            editQuery = editQuery.filter((_, i) => i !== srcGi);
        else editQuery = editQuery;
        dragState = null;
        dragOverGroup = null;
    }
</script>

{#if queryItemName !== undefined && queryItemValue !== undefined}
    <InfoButtonComponent buttonSize={18} inSearchBar={true}>
        {#if Array.isArray(queryItemValue.value)}
            <div part="lens-query-explain-aggregated">
                <div part="lens-query-explain-item-name">{queryItemName}</div>
                {#each queryItemValue.value as aggGroup, aggIdx (aggIdx)}
                    {#if aggIdx > 0}
                        <div part="lens-query-explain-agg-and">
                            {translate("query_item_multi_row_header")}
                        </div>
                    {:else}
                        <div part="lens-query-explain-agg-header">
                            {translate("query_item_multi_row_header_top")}
                        </div>
                    {/if}
                    <div part="lens-query-explain-agg-group">
                        {#each aggGroup as aggItem, aggValIdx (aggItem.value + aggValIdx)}
                            {#if aggValIdx > 0}
                                <span part="lens-query-explain-value-or"
                                    >or</span
                                >
                            {/if}
                            <span part="lens-query-explain-value-pill">
                                {getCategoryFromKey($catalogue, aggItem.value)
                                    ?.name ?? aggItem.value}: {aggItem.name}
                            </span>
                        {/each}
                    </div>
                {/each}
            </div>
        {:else}
            <div part="lens-query-explain-single">
                <span part="lens-query-explain-item-name">{queryItemName}:</span
                >
                <span part="lens-query-explain-value-pill"
                    >{queryItemValue.name}</span
                >
            </div>
        {/if}
    </InfoButtonComponent>
{:else}
    <div part="lens-query-explain-button">
        <InfoButtonComponent
            buttonSize={25}
            alignDialogue="bottom-left"
            dialogueMaxWidth="350px"
        >
            {#if $queryStore.flat().length > 0}
                <div part="lens-query-explain-info-header">
                    {translate("query_info_header")}
                </div>
                {#each $queryStore as group, gi (gi)}
                    {#if gi > 0}
                        <div part="lens-query-explain-or-divider">
                            <hr part="lens-query-explain-or-line" />
                            <span part="lens-query-explain-or-label"
                                >{translate("query_operator_or")}</span
                            >
                            <hr part="lens-query-explain-or-line" />
                        </div>
                    {/if}
                    <div part="lens-query-explain-group">
                        <div part="lens-query-explain-group-header">
                            <span part="lens-query-explain-group-label">
                                {translate("query_info_group_header")} {gi + 1}
                            </span>
                        </div>
                        {#each group as item, ii (item.id)}
                            {#if ii > 0}
                                <div part="lens-query-explain-and-connector">
                                    {translate("query_operator_and")}
                                </div>
                            {/if}
                            <div part="lens-query-explain-item">
                                <span part="lens-query-explain-item-name"
                                    >{item.name}</span
                                >
                                <div part="lens-query-explain-values">
                                    {#each item.values as value, vi (value.queryBindId)}
                                        {#if vi > 0}
                                            <span
                                                part="lens-query-explain-value-or"
                                                >or</span
                                            >
                                        {/if}
                                        <span
                                            part="lens-query-explain-value-pill"
                                            >{value.name}</span
                                        >
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/each}
            {:else}
                {noQueryMessage}
            {/if}
        </InfoButtonComponent>

        {#if $queryStore.flat().length > 0}
            <button
                part="lens-query-edit-open-btn"
                onclick={openModal}
                aria-label="Edit query">✎</button
            >
        {/if}

        <dialog
            bind:this={dialogEl}
            oncancel={(e) => {
                e.preventDefault();
                cancelEdit();
            }}
        >
            <div part="lens-query-edit-modal">
                <div part="lens-query-edit-header">
                    <span part="lens-query-edit-title"
                        >{translate("query_edit_title")}</span
                    >
                    <button
                        part="lens-query-edit-close"
                        onclick={cancelEdit}
                        aria-label="Close">✕</button
                    >
                </div>

                <div part="lens-query-edit-body">
                    {#if editQuery.flat().length > 0}
                        {#each editQuery as group, gi (gi)}
                            {#if gi > 0}
                                <div part="lens-query-explain-or-divider">
                                    <hr part="lens-query-explain-or-line" />
                                    <span part="lens-query-explain-or-label"
                                        >{translate("query_operator_or")}</span
                                    >
                                    <hr part="lens-query-explain-or-line" />
                                </div>
                            {/if}
                            <div
                                part="lens-query-explain-group"
                                class:drag-target={dragOverGroup === gi}
                                ondragover={(e) => onDragOver(e, gi)}
                                ondragleave={(e) => onDragLeave(e, gi)}
                                ondrop={(e) => onDrop(e, gi)}
                            >
                                <div part="lens-query-explain-group-header">
                                    <span part="lens-query-explain-group-label">
                                        {translate("query_info_group_header")}
                                        {gi + 1}
                                    </span>
                                    <button
                                        part="lens-query-edit-remove"
                                        onclick={() => removeGroup(gi)}
                                        aria-label="Remove group">✕</button
                                    >
                                </div>

                                {#each group as item, ii (item.id)}
                                    {#if ii > 0}
                                        <div
                                            part="lens-query-explain-and-connector"
                                        >
                                            {translate("query_operator_and")}
                                        </div>
                                    {/if}
                                    <div
                                        part="lens-query-explain-item"
                                        draggable="true"
                                        ondragstart={() => onDragStart(gi, ii)}
                                    >
                                        <span
                                            part="lens-query-edit-drag-handle"
                                            aria-hidden="true">⠿</span
                                        >
                                        <span
                                            part="lens-query-explain-item-name"
                                            >{item.name}</span
                                        >
                                        <div part="lens-query-explain-values">
                                            {#each item.values as value, vi (value.queryBindId)}
                                                {#if vi > 0}
                                                    <span
                                                        part="lens-query-explain-value-or"
                                                        >or</span
                                                    >
                                                {/if}
                                                {#if editingValue?.groupIdx === gi && editingValue?.itemIdx === ii && editingValue?.valueIdx === vi}
                                                    {@const cat = getCategoryFromKey($catalogue, item.key)}
                                                    {#if cat?.fieldType === "autocomplete" || cat?.fieldType === "single-select"}
                                                        <AutoCompleteComponent
                                                            element={cat as AutocompleteCategory}
                                                            initialValue={value.name}
                                                            onValueSelected={(newItem) => onPillValueSelected(gi, ii, vi, newItem)}
                                                        />
                                                    {:else if cat?.fieldType === "number"}
                                                        <NumberInputComponent
                                                            element={cat as NumericRangeCategory}
                                                            initialFrom={(value.value as { min?: number }).min}
                                                            initialTo={(value.value as { max?: number }).max}
                                                            onValueAdded={(newItem) => onPillValueSelected(gi, ii, vi, newItem)}
                                                        />
                                                    {:else if cat?.fieldType === "date"}
                                                        <DatePickerComponent
                                                            element={cat as DateRangeCategory}
                                                            initialFrom={(value.value as { min?: string }).min}
                                                            initialTo={(value.value as { max?: string }).max}
                                                            onValueAdded={(newItem) => onPillValueSelected(gi, ii, vi, newItem)}
                                                        />
                                                    {:else if cat?.fieldType === "string"}
                                                        <StringInputComponent
                                                            element={cat as StringCategory}
                                                            initialValue={value.name}
                                                            onValueAdded={(newItem) => onPillValueSelected(gi, ii, vi, newItem)}
                                                        />
                                                    {/if}
                                                    <button
                                                        part="lens-query-edit-remove"
                                                        onclick={() =>
                                                            (editingValue = null)}
                                                        aria-label="Cancel editing"
                                                        >✕</button
                                                    >
                                                {:else}
                                                    <span
                                                        part="lens-query-explain-value-pill"
                                                    >
                                                        {value.name}
                                                        {#if valueType(value) !== "aggregated"}
                                                            <button
                                                                part="lens-query-edit-pill-edit"
                                                                onclick={() =>
                                                                    (editingValue =
                                                                        {
                                                                            groupIdx:
                                                                                gi,
                                                                            itemIdx:
                                                                                ii,
                                                                            valueIdx:
                                                                                vi,
                                                                        })}
                                                                aria-label="Edit value"
                                                                >✎</button
                                                            >
                                                        {/if}
                                                        <button
                                                            part="lens-query-edit-remove"
                                                            onclick={() =>
                                                                removeValue(
                                                                    gi,
                                                                    ii,
                                                                    vi,
                                                                )}
                                                            aria-label="Remove value"
                                                            >✕</button
                                                        >
                                                    </span>
                                                {/if}
                                            {/each}
                                        </div>
                                        <button
                                            part="lens-query-edit-remove"
                                            onclick={() => removeItem(gi, ii)}
                                            aria-label="Remove criterion"
                                            >✕</button
                                        >
                                    </div>
                                {/each}
                            </div>
                        {/each}
                        {#if editingValue !== null}
                            <p part="lens-query-edit-hint">
                                {translate("query_edit_finish_editing")}
                            </p>
                        {/if}
                    {:else}
                        <p part="lens-query-edit-empty">{noQueryMessage}</p>
                    {/if}
                </div>

                <div part="lens-query-edit-footer">
                    <button
                        part="lens-query-edit-cancel-btn"
                        onclick={cancelEdit}
                        >{translate("query_edit_cancel")}</button
                    >
                    <button
                        part="lens-query-edit-save-btn"
                        onclick={saveQuery}
                        disabled={editingValue !== null}
                        >{translate("query_edit_save")}</button
                    >
                </div>
            </div>
        </dialog>
    </div>
{/if}

<style>
    [part~="lens-query-explain-button"] {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        height: 100%;
        padding: var(--gap-xxs);
        border: solid 1px var(--light-blue);
        border-radius: var(--border-radius-small);
    }

    [part~="lens-query-edit-open-btn"] {
        background: none;
        border: 1px solid var(--light-blue);
        cursor: pointer;
        font-size: var(--font-size-m);
        color: var(--blue);
        padding: 2px 8px;
        border-radius: var(--border-radius-small);
        line-height: 1;
        flex-shrink: 0;
        margin-left: var(--gap-xxs);
    }

    [part~="lens-query-edit-open-btn"]:hover {
        background: var(--lightest-gray);
        color: var(--light-blue);
    }

    /* ── Modal dialog ── */

    dialog {
        border: none;
        border-radius: var(--border-radius-small);
        padding: 0;
        box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.15),
            0 2px 6px rgba(0, 0, 0, 0.1);
        max-width: min(520px, 90vw);
        width: 100%;
    }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.35);
    }

    [part~="lens-query-edit-modal"] {
        display: flex;
        flex-direction: column;
        font-family: inherit;
        font-size: var(--font-size-s);
        color: var(--dark-gray);
    }

    [part~="lens-query-edit-header"] {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--gap-xs) var(--gap-xs) var(--gap-xs) var(--gap-s);
        border-bottom: 1px solid var(--light-gray);
    }

    [part~="lens-query-edit-title"] {
        font-weight: bold;
        font-size: var(--font-size-m);
    }

    [part~="lens-query-edit-close"] {
        background: none;
        border: none;
        cursor: pointer;
        font-size: var(--font-size-m);
        color: var(--gray);
        padding: 4px 8px;
        border-radius: var(--border-radius-small);
        line-height: 1;
    }

    [part~="lens-query-edit-close"]:hover {
        color: var(--dark-gray);
        background: var(--lightest-gray);
    }

    [part~="lens-query-edit-body"] {
        padding: var(--gap-s);
        overflow-y: auto;
        max-height: 60vh;
    }

    [part~="lens-query-edit-footer"] {
        display: flex;
        justify-content: flex-end;
        gap: var(--gap-xs);
        padding: var(--gap-xs) var(--gap-s);
        border-top: 1px solid var(--light-gray);
    }

    [part~="lens-query-edit-cancel-btn"] {
        padding: 6px 16px;
        border: 1px solid var(--gray);
        border-radius: var(--border-radius-small);
        background: transparent;
        cursor: pointer;
        font-size: var(--font-size-s);
        color: var(--dark-gray);
    }

    [part~="lens-query-edit-cancel-btn"]:hover {
        background: var(--lightest-gray);
    }

    [part~="lens-query-edit-save-btn"] {
        padding: 6px 16px;
        border: none;
        border-radius: var(--border-radius-small);
        background: var(--blue);
        color: var(--white);
        cursor: pointer;
        font-size: var(--font-size-s);
        font-weight: bold;
    }

    [part~="lens-query-edit-save-btn"]:hover {
        background: var(--light-blue);
    }

    [part~="lens-query-edit-save-btn"]:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* ── Edit controls ── */

    [part~="lens-query-edit-remove"] {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--gray);
        font-size: var(--font-size-xs);
        padding: 0 2px;
        line-height: 1;
        flex-shrink: 0;
    }

    [part~="lens-query-edit-remove"]:hover {
        color: var(--red);
    }

    [part~="lens-query-edit-pill-edit"] {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--gray);
        font-size: var(--font-size-xs);
        padding: 0 2px;
        line-height: 1;
    }

    [part~="lens-query-edit-pill-edit"]:hover {
        color: var(--blue);
    }

    [part~="lens-query-edit-drag-handle"] {
        cursor: grab;
        color: var(--gray);
        font-size: var(--font-size-m);
        flex-shrink: 0;
        user-select: none;
    }

    [part~="lens-query-edit-drag-handle"]:active {
        cursor: grabbing;
    }

    [part~="lens-query-edit-hint"] {
        font-size: var(--font-size-xs);
        color: var(--gray);
        margin-top: var(--gap-xxs);
        text-align: center;
    }

    [part~="lens-query-edit-empty"] {
        color: var(--gray);
        text-align: center;
        padding: var(--gap-m) 0;
    }

    /* ── Group drag-target highlight ── */

    .drag-target {
        outline: 2px dashed var(--light-blue);
        outline-offset: 2px;
    }

    /* ── Full query dialog shared styles ── */

    [part~="lens-query-explain-info-header"] {
        font-size: var(--font-size-xs);
        color: var(--gray);
        margin-bottom: var(--gap-xxs);
    }

    [part~="lens-query-explain-group"] {
        border-left: 3px solid var(--light-blue);
        background-color: var(--lightest-gray);
        border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
        padding: var(--gap-xs);
        margin-bottom: var(--gap-xxs);
    }

    [part~="lens-query-explain-group-header"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xxs);
        margin-bottom: var(--gap-xxs);
    }

    [part~="lens-query-explain-group-label"] {
        display: inline-block;
        background: var(--blue);
        color: var(--white);
        border-radius: var(--border-radius-small);
        padding: 1px 8px;
        font-size: var(--font-size-xs);
        font-weight: bold;
    }

    [part~="lens-query-explain-and-connector"] {
        display: inline-flex;
        border: 1px solid var(--light-blue);
        border-radius: 999px;
        padding: 1px 8px;
        font-size: var(--font-size-xs);
        color: var(--blue);
        font-weight: bold;
        margin: 2px 0;
    }

    [part~="lens-query-explain-or-divider"] {
        display: flex;
        align-items: center;
        gap: var(--gap-xxs);
        margin: var(--gap-xs) 0;
    }

    [part~="lens-query-explain-or-line"] {
        flex: 1;
        border: none;
        border-top: 1px solid var(--gray);
        margin: 0;
    }

    [part~="lens-query-explain-or-label"] {
        background: var(--lightest-gray);
        border: 1px solid var(--gray);
        border-radius: 999px;
        padding: 1px 8px;
        font-size: var(--font-size-xs);
        font-weight: bold;
        color: var(--dark-gray);
        white-space: nowrap;
    }

    [part~="lens-query-explain-item"] {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 4px;
        margin-bottom: var(--gap-xxs);
        text-align: left;
    }

    [part~="lens-query-explain-item-name"] {
        font-weight: bold;
        overflow-wrap: anywhere;
        padding-top: 1px;
    }

    [part~="lens-query-explain-values"] {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        flex: 1;
    }

    [part~="lens-query-explain-value-pill"] {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        background: var(--lightest-blue);
        color: var(--dark-blue);
        border: 1px solid var(--lightest-blue);
        border-radius: 999px;
        padding: 1px 6px;
        font-size: var(--font-size-xs);
        overflow-wrap: anywhere;
    }

    [part~="lens-query-explain-value-or"] {
        font-size: var(--font-size-xs);
        color: var(--gray);
        font-style: italic;
    }

    /* ── Aggregated values (AND of ORs) ── */

    [part~="lens-query-explain-agg-header"] {
        font-size: var(--font-size-xs);
        font-weight: bold;
        padding-bottom: 2px;
    }

    [part~="lens-query-explain-agg-and"] {
        font-size: var(--font-size-xs);
        font-weight: bold;
        color: var(--blue);
        padding: 2px 0;
    }

    [part~="lens-query-explain-agg-group"] {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        padding-left: var(--gap-xxs);
    }

    /* ── Single chip dialog ── */

    [part~="lens-query-explain-single"] {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        text-align: left;
        overflow-wrap: anywhere;
    }

    [part~="lens-query-explain-aggregated"] {
        text-align: left;
    }
</style>
