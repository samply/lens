<svelte:options
    customElement={{
        tag: "lens-result-table",
    }}
/>

<script lang="ts">
    import { datarequestsStore } from "../../stores/datarequests";
    import {
        getSitePopulationForCode,
        getSitePopulationForStratumCode,
        responseStore,
    } from "../../stores/response";
    import TableItemComponent from "./TableItemComponent.svelte";
    import { lensOptions } from "../../stores/options";
    import type { HeaderData } from "../../types/options";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";

    const claimedText = $derived(
        $lensOptions?.tableOptions.claimedText || "Processing...",
    );

    /**
     * data-types for the table
     * can be set via options component
     */
    let headerData: HeaderData[] = $derived(
        $lensOptions?.tableOptions.headerData || [],
    );

    /**
     * watches the responseStore for changes to update the table
     */
    type TableRowData = (string | number)[][];
    let tableRowData: TableRowData = $derived.by(() => {
        let tableRowData: TableRowData = [];

        for (const [key, value] of $responseStore) {
            if (!["claimed", "succeeded"].includes(value.status)) continue;

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
                        $lensOptions?.siteMappings?.[key];
                    if (name === undefined) continue;
                    tableRow.push(name);
                    continue;
                }

                if (value.status === "claimed") {
                    tableRow.push(claimedText);
                } else if (value.status === "succeeded") {
                    if (header.dataKey !== undefined) {
                        tableRow.push(
                            getSitePopulationForCode(
                                value.data,
                                header.dataKey,
                            ),
                        );
                    } else if (header.aggregatedDataKeys !== undefined) {
                        let aggregatedPopulation = 0;
                        for (const dataKey of header.aggregatedDataKeys) {
                            if (dataKey.groupCode) {
                                aggregatedPopulation +=
                                    getSitePopulationForCode(
                                        value.data,
                                        dataKey.groupCode,
                                    );
                            } else if (
                                dataKey.stratifierCode &&
                                dataKey.stratumCode
                            ) {
                                aggregatedPopulation +=
                                    getSitePopulationForStratumCode(
                                        value.data,
                                        dataKey.stratumCode,
                                        dataKey.stratifierCode,
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
    const checkAllBiobanks = (): void => {
        if (allChecked) {
            $datarequestsStore = [];
        } else {
            $datarequestsStore = tableRowData.map(
                (tableRow: (string | number)[]) => tableRow[0] as string,
            );
        }
    };

    interface Props {
        title?: string;
        pageSize?: number;
    }

    let { title = "", pageSize = 10 }: Props = $props();
    let activePage = $state(1);
    let sortColumnIndex = $state(0);
    let sortAscending = $state(true);
    let visibleRows: TableRowData = $derived.by(() => {
        // Array.sort sorts in place, so make a copy first
        const tableRowsCopy = [...tableRowData];

        // sort
        tableRowsCopy.sort((a, b) => {
            // Always sort claimedText below everything else
            if (a[sortColumnIndex] === claimedText) {
                return 1;
            } else if (b[sortColumnIndex] === claimedText) {
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
</script>

<h4 part="result-table-title">{title}</h4>
<table part="result-table">
    <thead part="table-header">
        <tr part="table-header-row">
            <th part="table-header-cell table-header-cell-checkbox"
                ><input
                    part="table-header-checkbox"
                    type="checkbox"
                    checked={allChecked}
                    onchange={checkAllBiobanks}
                /></th
            >
            <!-- eslint-disable-next-line svelte/require-each-key -->
            {#each headerData as header, index}
                <th
                    part="table-header-cell table-header-datatype"
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
    <tbody part="table-body">
        <!-- eslint-disable-next-line svelte/require-each-key -->
        {#each visibleRows as tableRow}
            <TableItemComponent {tableRow} />
        {/each}
    </tbody>
</table>
<slot name="above-pagination" />
<div part="table-pagination">
    <button
        part="table-pagination-button pagination-pagination-previous"
        disabled={activePage === 1}
        onclick={() => (activePage -= 1)}>&#8592;</button
    >
    <div part="table-pagination-pagenumber">{activePage}</div>
    <button
        part="table-pagination-button pagination-pagination-next"
        disabled={activePage === Math.ceil(tableRowData.length / pageSize) ||
            tableRowData.length === 0}
        onclick={() => (activePage += 1)}>&#8594;</button
    >
</div>
<slot name="beneath-pagination" />
