<script lang="ts">
    import type { Category } from "../../types/treeData";
    import { queryStore } from "../../stores/query";
    import { v4 as uuidv4 } from "uuid";
    import QuerySelectComponent from "./QuerySelectComponent.svelte";

    export let element: Category;
</script>

<div part="lens-catalogue-section-single-select-wrapper">
    {#each element.criteria as criterion}
        <div part="lens-catalogue-section-single-select-item">
            <span part="lens-catalogue-section-single-select-item-name">
                {criterion.name}
            </span>
            <span
                part="lens-catalogue-section-groups-checkboxes lens-catalogue-section-single-select-groups-checkboxes"
            >
                {#each $queryStore as _, index}
                    <QuerySelectComponent
                        {index}
                        queryItem={{
                            id: uuidv4(),
                            key: element.key,
                            name: element.name,
                            values: [
                                {
                                    name: criterion.name,
                                    value: criterion.key,
                                },
                            ],
                        }}
                    />
                {/each}
            </span>
        </div>
    {/each}
</div>
