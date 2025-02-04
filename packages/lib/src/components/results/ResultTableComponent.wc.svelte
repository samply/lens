<svelte:options
    customElement={{
        tag: "lens-result-table",
    }}
/>

<script lang="ts">
    import { uiSiteMappingsStore } from "../../stores/mappings";
    import { datarequestsStore } from "../../stores/datarequests";
    import {
        getSitePopulationForCode,
        getSitePopulationForStratumCode,
        responseStore,
    } from "../../stores/response";
    import TableItemComponent from "./TableItemComponent.svelte";
    import { lensOptions } from "../../stores/options";
    import type { HeaderData } from "../../types/biobanks";
    import type { Site } from "../../types/response";
    import InfoButtonComponent from "../buttons/InfoButtonComponent.wc.svelte";
    import type { ResponseStore } from "../../types/backend";

    export let title: string = "";

    let claimedText: string;
    $: claimedText =
        ($lensOptions?.tableOptions as { claimedText: string })?.claimedText ||
        "Processing...";

    /**
     * data-types for the table
     * can be set via options component
     */
    let options: { headerData: HeaderData[] };
    $: options = (($lensOptions?.tableOptions && $lensOptions.tableOptions) as {
        headerData: HeaderData[];
    }) || {
        headerData: [{ title: "", dataKey: "", aggregatedDataKeys: [] }],
    };

    /**
     * watches the responseStore for changes to update the table
     */
    type TableRowData = (string | number)[][];
    let tableRowData: TableRowData = [];

    const buildTableRowData = (responseStore: ResponseStore): void => {
        tableRowData = [];

        responseStore.forEach((value: Site, key: string): void => {
            if (!["claimed", "succeeded"].includes(value.status)) return;

            let tableRow: (string | number)[] = [];

            /**
             * builds the table items for each row
             * the first item is the name of the collection
             * the following items are the population for each data type (single or aggregated)
             */
            options.headerData.forEach(
                (header: HeaderData, index: number): void => {
                    if (index === 0) {
                        const name: string | undefined =
                            $uiSiteMappingsStore.get(key);
                        if (name === undefined) return;
                        tableRow.push(name);
                        return;
                    }

                    if (value.status === "claimed") {
                        tableRow.push(claimedText);
                        return;
                    }

                    if (header.dataKey) {
                        tableRow.push(
                            getSitePopulationForCode(
                                value.data!,
                                header.dataKey,
                            ),
                        );
                        return;
                    }

                    let aggregatedPopulation: number = 0;

                    header.aggregatedDataKeys?.forEach((dataKey) => {
                        if (dataKey.groupCode) {
                            aggregatedPopulation += getSitePopulationForCode(
                                value.data!,
                                dataKey.groupCode,
                            );
                        } else if (
                            dataKey.stratifierCode &&
                            dataKey.stratumCode
                        ) {
                            aggregatedPopulation +=
                                getSitePopulationForStratumCode(
                                    value.data!,
                                    dataKey.stratumCode,
                                    dataKey.stratifierCode,
                                );
                        }
                    });

                    tableRow.push(aggregatedPopulation);
                },
            );

            tableRowData = [...tableRowData, tableRow];
        });
    };

    $: buildTableRowData($responseStore);

    /**
     * watches the datarequestsStore for changes to check or uncheck the checkbox
     */
    let allChecked: boolean = false;
    $: allChecked =
        $datarequestsStore.length === tableRowData.length &&
        tableRowData.length !== 0;

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

    export let pageSize = 10;
    let activePage = 1;
    let sortColumnIndex = 0;
    let sortAscending = true;

    let visibleRows: TableRowData;
    $: {
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
        visibleRows = tableRowsCopy.slice(
            (activePage - 1) * pageSize,
            activePage * pageSize,
        );
    }

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
                    bind:checked={allChecked}
                    on:change={checkAllBiobanks}
                /></th
            >
            {#each options.headerData as header, index}
                <th
                    part="table-header-cell table-header-datatype"
                    on:click={() => clickedOnColumnHeader(index)}
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
        on:click={() => (activePage -= 1)}>&#8592;</button
    >
    <div part="table-pagination-pagenumber">{activePage}</div>
    <button
        part="table-pagination-button pagination-pagination-next"
        disabled={activePage === Math.ceil(tableRowData.length / pageSize) ||
            tableRowData.length === 0}
        on:click={() => (activePage += 1)}>&#8594;</button
    >
</div>
<slot name="beneath-pagination" />
