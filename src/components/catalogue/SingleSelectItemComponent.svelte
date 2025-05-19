<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import type { SingleSelectCategory, Criteria } from "../../types/catalogue";
    import AddButton from "./AddButton.svelte";
    import { activeQueryGroupIndex, addItemToQuery } from "../../stores/query";

    interface Props {
        element: SingleSelectCategory;
        criterion: Criteria;
    }

    let { element, criterion }: Props = $props();

    function onclick() {
        addItemToQuery(
            {
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
                        queryBindId: uuidv4(),
                    },
                ],
            },
            $activeQueryGroupIndex,
        );
    }
</script>

<span part="single-select-wrapper">{criterion.name}</span>
<AddButton {onclick} />

<style>
    [part~="single-select-wrapper"] {
        width: 100%; /* Take all space from the 1fr column */
        max-width: 100%; /* Prevent overflow */
        overflow-wrap: break-word; /* In case of long text */
    }
</style>
