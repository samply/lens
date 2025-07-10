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
    } from "../../stores/response";
    import TableItemComponent from "./TableItemComponent.svelte";
    import { lensOptions } from "../../stores/options";
    import type { HeaderData } from "../../types/options";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import { translate } from "../../helpers/translations";

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
                // First column is the site name
                if (index === 0) {
                    const name: string | undefined =
                        $lensOptions?.siteMappings?.[site];
                    if (name === undefined) continue;
                    tableRow.push(name);
                    continue;
                }

                if (status === "claimed") {
                    tableRow.push(translate("loading"));
                } else if (status === "succeeded") {
                    if (header.dataKey !== undefined) {
                        tableRow.push(getSiteTotal(site, header.dataKey));
                    } else if (header.aggregatedDataKeys !== undefined) {
                        let aggregatedPopulation = 0;
                        for (const dataKey of header.aggregatedDataKeys) {
                            if (dataKey.groupCode) {
                                aggregatedPopulation += getSiteTotal(
                                    site,
                                    dataKey.groupCode,
                                );
                            } else if (
                                dataKey.stratifierCode &&
                                dataKey.stratumCode
                            ) {
                                aggregatedPopulation += getSiteStratum(
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
     *  Configuration options for the result table.
     */
    interface Props {
        /** The title to be displayed in the table header. */
        title?: string;
        /** The number of rows to display per page. Defaults to 10. */
        pageSize?: number;
        /** Whether to display a select box for changing the pagesize. If you set the pagesize otherthen 10,25,50 it will added as an option. */
        pageSizeSwitcher?: boolean;
    }

    let {
        title = "",
        pageSize = 10,
        pageSizeSwitcher = false,
    }: Props = $props();

    let activePage = $state(1);
    let sortColumnIndex = $state(0);
    let sortAscending = $state(true);
    let visibleRows: TableRowData = $derived.by(() => {
        // Array.sort sorts in place, so make a copy first
        const tableRowsCopy = [...tableRowData];

        // sort
        tableRowsCopy.sort((a, b) => {
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

        // paginate
        return tableRowsCopy.slice(
            (activePage - 1) * pageSize,
            activePage * pageSize,
        );
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

    let pageSizeOptions: { size: number; text: string }[] = [
        { size: 10, text: `10` },
        { size: 25, text: `25` },
        { size: 50, text: `50` },
    ];

    if (pageSize != 10 && pageSize != 25 && pageSize != 50) {
        pageSizeOptions.push({ size: pageSize, text: String(pageSize) });
        pageSizeOptions.sort((a, b) => a.size - b.size);
    }

    let pageSizeOption = $state(pageSizeOptions[0]);
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
                        <span style="font-size: 0.8em;">
                            {#if sortAscending}
                                ▲
                            {:else}
                                ▼
                            {/if}
                        </span>
                    {/if}
                </th>
            {/each}
        </tr>
    </thead>
    <tbody part="lens-result-table-table-body">
        <!-- eslint-disable-next-line svelte/require-each-key -->
        {#each visibleRows as tableRow}
            <TableItemComponent {tableRow} />
        {/each}
    </tbody>
</table>
<slot name="lens-result-above-pagination" />
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
        disabled={activePage === Math.ceil(tableRowData.length / pageSize) ||
            tableRowData.length === 0}
        onclick={() => (activePage += 1)}>&#8594;</button
    >
    {#if pageSizeSwitcher === true}
        <span part="lens-result-table-pagination-switcher">
            Results per page:
            <select
                bind:value={pageSizeOption}
                onchange={() => (pageSize = pageSizeOption.size)}
            >
                {#each pageSizeOptions as option (option.size)}
                    <option value={option}>
                        {option.text}
                    </option>
                {/each}
            </select>
        </span>
    {/if}
</div>
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

    [part~="lens-result-table-pagination-switcher"] {
        margin-left: 20px;
    }
</style>
