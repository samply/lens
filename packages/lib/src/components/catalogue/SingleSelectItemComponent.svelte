<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import type { Category } from "../../types/treeData";
    import type { Criteria } from "../../types/treeData";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";

    export let element: Category;
    export let criterion: Criteria;

    const queryBindId: string = uuidv4();
</script>

<div part="criterion-section criterion-section-values">
    <span part="criterion-single-select-name">
        {criterion.name}
    </span>
</div>
<QueryAddButtonComponent
    queryItem={{
        id: uuidv4(),
        key: element.key,
        name: element.name,
        type: "type" in element && element.type,
        values: [
            {
                name: criterion.name,
                value: criterion.key,
                queryBindId: queryBindId,
            },
        ],
    }}
/>
