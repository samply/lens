<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import type { SingleSelectCategory, Criteria } from "../../types/catalogue";
    import QueryAddButtonComponent from "./QueryAddButtonComponent.svelte";
    import type { QueryItem } from "../../types/queryData";

    interface Props {
        element: SingleSelectCategory;
        criterion: Criteria;
    }

    let { element, criterion }: Props = $props();

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
