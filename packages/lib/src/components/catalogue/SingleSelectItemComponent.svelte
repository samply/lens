<script lang="ts">
    import { queryStore } from "../../stores/query";
    import { v4 as uuidv4 } from "uuid";
    import QuerySelectComponent from "./QuerySelectComponent.svelte";
    import { catalogueTextStore } from "../../stores/texts";
    import type { Category } from "../../types/treeData";
    import type { Criteria } from "../../types/treeData";
    
    export let element: Category;
    export let criterion: Criteria;

    const queryBindId: string = uuidv4();
</script>


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
                                queryBindId: queryBindId,
                            },
                        ],
                    }}
                />
            {/each}
        </span>
    </div>
</div>