<script lang="ts">
    import type { Category } from "../../types/treeData";
    import { queryStore } from "../../stores/query";
    import { v4 as uuidv4 } from "uuid";
    import QuerySelectComponent from "./QuerySelectComponent.svelte";
    import { catalogueTextStore } from "../../stores/texts";

    export let element: Category;
</script>

<div part="criterion-wrapper single-select-wrapper">
    {#each element.criteria as criterion}
        <div part="criterion-item criterion-item-single-select">
            <div part="criterion-section criterion-section-values">
                <span part="criterion-single-select-name">
                    {criterion.name}
                </span>
            </div>
            <div part="criterion-section criterion-section-groups">
                <span
                    part="criterion-group-label criterion-group-label-single-select"
                    >{$catalogueTextStore.group}</span
                >
                <span
                    part="criterion-group-wrapper criterion-group-wrapper-single-select"
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
        </div>
    {/each}
</div>
