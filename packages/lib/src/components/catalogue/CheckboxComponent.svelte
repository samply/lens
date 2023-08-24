<script lang="ts">
    import type { Criteria } from "../../types/treeData";

    export let criteria: Criteria[] = [];
</script>

<div>
    {#each criteria as criteriaItem}
        <div>
            <input type="checkbox" id={criteriaItem.key} name={criteriaItem.key} value={criteriaItem.key}>
            <label for={criteriaItem.key}>{criteriaItem.name}</label>
        </div>
    {/each}
</div>