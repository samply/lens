<svelte:options
    customElement={{
        tag: "lens-result-table",
    }}
/>

<script lang="ts">
    import { datarequestsStore } from "../../stores/datarequests";
    import {
        getSiteTotal,
        getSiteStratum,
        siteStatus,
        siteResults,
    } from "../../stores/response";
    import { lensOptions } from "../../stores/options";
    import type { HeaderData } from "../../types/options";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import Tooltip from "../informational/Tooltip.svelte";
    import { translate } from "../../helpers/translations";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { SvelteURL } from "svelte/reactivity";

    /**
     * data-types for the table
     * can be set via options component
     */
    let headerData: HeaderData[] = $derived(
        $lensOptions?.tableOptions?.headerData || [],
    );

    /**
     * watches the responseStore for changes to update the table
     */
    type TableRowData = (string | number)[][];
    let tableRowData: TableRowData = $derived.by(() => {
        let tableRowData: TableRowData = [];

        for (const [site, status] of $siteStatus) {
            if (!["claimed", "succeeded"].includes(status)) continue;

            let tableRow: (string | number)[] = [];

            /**
             * builds the table items for each row
             * the first item is the name of the collection
             * the following items are the population for each data type (single or aggregated)
             */
            for (const [index, header] of headerData.entries()) {
                // First column is the site
                if (index === 0) {
                    tableRow.push(site);
                    continue;
                }

                if (status === "claimed") {
                    tableRow.push(translate("loading"));
                } else if (status === "succeeded") {
                    if (header.dataKey !== undefined) {
                        tableRow.push(
                            getSiteTotal($siteResults, site, header.dataKey),
                        );
                    } else if (header.aggregatedDataKeys !== undefined) {
                        let aggregatedPopulation = 0;
                        for (const dataKey of header.aggregatedDataKeys) {
                            if (dataKey.groupCode) {
                                aggregatedPopulation += getSiteTotal(
                                    $siteResults,
                                    site,
                                    dataKey.groupCode,
                                );
                            } else if (
                                dataKey.stratifierCode &&
                                dataKey.stratumCode
                            ) {
                                aggregatedPopulation += getSiteStratum(
                                    $siteResults,
                                    site,
                                    dataKey.stratifierCode,
                                    dataKey.stratumCode,
                                );
                            }
                        }
                        tableRow.push(aggregatedPopulation);
                    } else {
                        console.error(
                            "An element of tableOptions.headerData in the lens options is missing both 'dataKey' and 'aggregatedDataKeys' property, but one is required",
                        );
                    }
                }
            }

            tableRowData = [...tableRowData, tableRow];
        }

        return tableRowData;
    });

    /**
     * watches the datarequestsStore for changes to check or uncheck the checkbox
     */
    let allChecked: boolean = $derived(
        $datarequestsStore.length === tableRowData.length &&
            tableRowData.length !== 0,
    );

    /**
     * checks or unchecks all biobanks
     */
    const checkAllSites = (): void => {
        if (allChecked) {
            $datarequestsStore = [];
        } else {
            $datarequestsStore = tableRowData.map(
                (tableRow: (string | number)[]) => tableRow[0] as string,
            );
        }
    };

    /**
     * adds and removes tableRows from the datarequestsStore whenever a checkbox is checked or unchecked
     */
    const updateStoreOnCheck = (tableRow: (string | number)[]): void => {
        const siteId = tableRow[0] as string;
        const isChecked = $datarequestsStore.includes(siteId);

        if (!isChecked) {
            datarequestsStore.update((store: string[]) => {
                return [...store, siteId];
            });
        } else {
            datarequestsStore.update((store: string[]) => {
                return store.filter((site: string) => site !== siteId);
            });
        }
    };

    onMount(() => {
        // load datarequests from the URL if they exist
        const encodedDatarequests = new URLSearchParams(
            window.location.search,
        ).get("datarequests");
        if (encodedDatarequests !== null) {
            try {
                const datarequests = JSON.parse(
                    new TextDecoder().decode(
                        Uint8Array.from(atob(encodedDatarequests), (c) =>
                            c.charCodeAt(0),
                        ),
                    ),
                );
                datarequestsStore.set(datarequests);
            } catch {
                console.error(
                    "Failed to parse datarequests from URL:",
                    encodedDatarequests,
                );
            }
        }

        // update the URL when the query changes
        datarequestsStore.subscribe(() => {
            if (get(lensOptions)?.autoUpdateDatarequestsInUrl ?? true) {
                const datarequests = get(datarequestsStore);
                const url = new SvelteURL(window.location.href);

                if (datarequests.flat().length === 0) {
                    url.searchParams.delete("datarequests");
                } else {
                    const encodedDatarequests = btoa(
                        String.fromCharCode(
                            ...new TextEncoder().encode(
                                JSON.stringify(datarequests),
                            ),
                        ),
                    );
                    url.searchParams.set("datarequests", encodedDatarequests);
                }

                window.history.replaceState({}, "", url.toString());
            }
        });
    });

    /**
     *  Configuration options for the result table.
     */
    interface Props {
        /** The title to be displayed in the table header. */
        title?: string;
        /** If set, limits the number of rows displayed and enables pagination. */
        pageSize?: number;
        /** Callback that returns a tooltip message for a given number. If defined, adds a tooltip to numeric cells with the returned message. */
        showRoundedTo?: (value: number) => string;
    }

    let { title = "", pageSize, showRoundedTo }: Props = $props();

    let activePage = $state(1);
    let sortColumnIndex = $state(0);
    let sortAscending = $state(true);
    let visibleRows: TableRowData = $derived.by(() => {
        // Sort
        const rows = [...tableRowData].sort((a, b) => {
            // Always sort loading text below everything else
            if (a[sortColumnIndex] === translate("loading")) {
                return 1;
            } else if (b[sortColumnIndex] === translate("loading")) {
                return -1;
            }

            if (a[sortColumnIndex] < b[sortColumnIndex]) {
                return sortAscending ? -1 : 1;
            }
            if (a[sortColumnIndex] > b[sortColumnIndex]) {
                return sortAscending ? 1 : -1;
            }
            return 0;
        });

        // Paginate
        if (pageSize === undefined) {
            return rows;
        } else {
            return rows.slice(
                (activePage - 1) * pageSize,
                activePage * pageSize,
            );
        }
    });

    /**
     * Called when a user clicks on a column header to change the sorting
     * @param index the index of the column on which the user clicked
     */
    function clickedOnColumnHeader(index: number): void {
        if (index !== sortColumnIndex) {
            sortColumnIndex = index;
            sortAscending = true;
        } else {
            sortAscending = !sortAscending;
        }
    }
</script>

<h4 part="lens-result-table-title">{title}</h4>
<table part="lens-result-table">
    <thead part="lens-result-table-header">
        <tr part="lens-result-table-header-row">
            <th
                part="lens-result-table-header-cell lens-result-table-header-cell-checkbox"
                ><input
                    part="lens-result-table-header-checkbox"
                    type="checkbox"
                    checked={allChecked}
                    onchange={checkAllSites}
                /></th
            >
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each headerData as header, index}
                <th
                    part="lens-result-table-header-cell lens-result-table-header-datatype"
                    onclick={() => clickedOnColumnHeader(index)}
                >
                    {header.title}
                    {#if header.hintText}
                        <InfoButtonComponent message={header.hintText} />
                    {/if}
                    {#if index === sortColumnIndex}
                        <span style="font-size: clamp(12px, 0.8rem, 32px);">
                            {#if sortAscending}
                                ▲
                            {:else}
                                ▼
                            {/if}
                        </span>
                    {:else}
                        <span
                            style="font-size: clamp(10px, 0.4rem, 22px); opacity: 0.5;"
                        >
                            ▲▼
                        </span>
                    {/if}
                </th>
            {/each}
        </tr>
    </thead>
    <tbody part="lens-result-table-table-body">
        {#each visibleRows as tableRow (tableRow[0])}
            <tr part="lens-result-table-item-body-row">
                <td
                    part="lens-result-table-item-body-cell lens-result-table-item-body-cell-checkbox"
                    ><input
                        part="lens-result-table-item-body-checkbox"
                        type="checkbox"
                        checked={$datarequestsStore.includes(
                            tableRow[0] as string,
                        )}
                        onchange={() => updateStoreOnCheck(tableRow)}
                    /></td
                >
                {#each tableRow as data, index (index)}
                    <td part="lens-result-table-item-body-cell">
                        {#if index === 0}
                            {@const siteInfo =
                                $lensOptions?.siteMappings?.[data]}
                            {@const siteName =
                                typeof siteInfo === "string"
                                    ? siteInfo
                                    : siteInfo?.displayName || data}
                            {@const collectionId =
                                typeof siteInfo === "object"
                                    ? siteInfo.collectionId
                                    : undefined}
                            {#if collectionId && $lensOptions?.collectionBaseUrl}
                                <a
                                    part="lens-result-table-item-body-cell-link"
                                    href={`${$lensOptions?.collectionBaseUrl}${collectionId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {siteName}
                                    <svg
                                        style="width: 0.9em; height: 0.9em;"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        ><path
                                            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                                        /><polyline
                                            points="15 3 21 3 21 9"
                                        /><line
                                            x1="10"
                                            y1="14"
                                            x2="21"
                                            y2="3"
                                        /></svg
                                    >
                                </a>
                            {:else}
                                {siteName}
                            {/if}
                        {:else if index !== 0 && showRoundedTo && typeof data === "number"}
                            <Tooltip message={showRoundedTo(data)}>
                                {data}
                            </Tooltip>
                        {:else}
                            {data}
                        {/if}
                    </td>
                {/each}
            </tr>
        {/each}
        <!-- Invisible rows for spacing -->
        {#if pageSize !== undefined && visibleRows.length < pageSize}
            {#each Array(pageSize - visibleRows.length).keys() as i (i)}
                <tr part="lens-result-table-item-body-row">
                    {#each Array(headerData.length + 1).keys() as j (j)}
                        <td part="lens-result-table-item-body-cell"></td>
                    {/each}
                </tr>
            {/each}
        {/if}
    </tbody>
</table>
<slot name="lens-result-above-pagination" />
{#if pageSize !== undefined}
    <div part="lens-result-table-pagination">
        <button
            part="lens-result-table-pagination-button lens-result-pagination-pagination-previous"
            disabled={activePage === 1}
            onclick={() => (activePage -= 1)}>&#8592;</button
        >
        <div part="lens-result-table-pagination-pagenumber">
            {activePage} / {tableRowData.length === 0
                ? 1
                : Math.ceil(tableRowData.length / pageSize)}
        </div>
        <button
            part="lens-result-table-pagination-button lens-result-pagination-pagination-next"
            disabled={activePage ===
                Math.ceil(tableRowData.length / pageSize) ||
                tableRowData.length === 0}
            onclick={() => (activePage += 1)}>&#8594;</button
        >
    </div>
{/if}
<slot name="beneath-pagination" />

<style>
    [part~="lens-result-table-title"] {
        text-align: center;
        margin: 0;
        padding-bottom: var(--gap-m);
    }

    [part~="lens-result-table"] {
        border-collapse: collapse;
        width: 100%;
        border-spacing: 0 15px;
        height: max-content;
        overflow: scroll;
    }

    [part~="lens-result-table-header"] {
        border-bottom: solid 1px var(--gray);
    }

    [part~="lens-result-table-header-row"] {
        text-align: left;
    }

    [part~="lens-result-table-header-cell"] {
        padding-bottom: var(--gap-xs);
        width: 32%;
        cursor: pointer;
        /* Prevent selecting text when clicking on the header */
        user-select: none;
    }

    [part~="lens-result-table-header-cell-checkbox"] {
        padding-bottom: var(--gap-xs);
        width: 4%;
    }

    [part~="lens-result-table-pagination"] {
        display: flex;
        justify-content: center;
        padding-top: var(--gap-m);
        gap: var(--gap-s);
        align-items: flex-end;
    }

    [part~="lens-result-table-pagination-button"]:enabled {
        border: solid 1px var(--blue);
        background: var(--white);
        border-radius: var(--border-radius-small);
        padding: var(--gap-xxs) var(--gap-s);
        cursor: pointer;
    }

    [part~="lens-result-table-pagination-button"]:disabled {
        border: solid 1px var(--light-gray);
        background: var(--white);
        border-radius: var(--border-radius-small);
        padding: var(--gap-xxs) var(--gap-s);
        cursor: auto;
    }

    [part~="lens-result-table-item-body-row"] {
        border-bottom: solid 1px var(--light-gray);
        height: 2em;
    }

    [part~="lens-result-table-item-body-cell-link"] {
        color: var(--blue);
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
</style>
