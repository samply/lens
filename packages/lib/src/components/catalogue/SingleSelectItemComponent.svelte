<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import type { CategoryField } from "../../types/treeData";
    import type { Criteria } from "../../types/treeData";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";
    import type { QueryItem } from "../../types/queryData";

    export let element: CategoryField;
    export let criterion: Criteria;

    const queryBindId: string = uuidv4();

    const queryItem: QueryItem = {
        id: uuidv4(),
        key: element.key,
        name: element.name,
        type: element.type,
        system: "system" in element ? element.system : "",
        values: [
            {
                name: criterion.name,
                value:
                    criterion.aggregatedValue !== undefined
                        ? criterion.aggregatedValue
                        : criterion.key,
                queryBindId: queryBindId,
            },
        ],
    };
</script>

<div part="criterion-section criterion-section-values">
    <span part="criterion-single-select-name">
        {criterion.name}
    </span>
</div>
<QueryAddButtonComponent {queryItem} />
