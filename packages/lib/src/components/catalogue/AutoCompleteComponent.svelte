<script lang="ts">
    import type { Criteria } from "../../types/treeData";
    
    export let criteria: Criteria[] = [];
</script>

<div>
    <input type="text" list="autocomplete-list" placeholder="Search for a diagnosis">
    <datalist id="autocomplete-list">
        {#each criteria as criteriaItem}
            <option value={criteriaItem.key}>{criteriaItem.description}</option>
        {/each}
    </datalist>
</div>