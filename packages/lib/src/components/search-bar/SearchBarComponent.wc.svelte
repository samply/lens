<svelte:options
customElement={{
    tag: 'lens-search-bar',
    props: {
        treeData: { type: 'Object' },
        noMatchesFoundMessage: { type: 'String' },
    },
}} />

<script lang="ts">
    import { writable } from "svelte/store";
    import type { Category } from "../../types/treeData";
    import { queryStore } from "../../stores/query";

    type AutoCompleteItem = {
        name: string;
        key: string;
        criterion: {
            key: string;
            name: string;
            description?: string;
        };
    }

    /**
     * props
     * @param treeData takes a Category tree to build the autocomplete items from
     * @param noMatchesFoundMessage takes a string to display when no matches are found
     */
    export let treeData: Category[] = [];
    export let noMatchesFoundMessage: string = 'No matches found'

    /**
     * Build a full list of autocomplete items and saves it to 'criteria'
     * @param category
     */
    const buildDatalistItemFromBottomCategory = (category: Category): AutoCompleteItem [] => {
        let autoCompleteItems: AutoCompleteItem []
        if( 'criteria' in category)
            autoCompleteItems = category.criteria.map(criterion => ({name: category.name, key: category.key, criterion: criterion}))
        return autoCompleteItems
    };

    /**
     * Build a full list of autocomplete items from a given Category tree
     * @param treeData
     */
    const buildDatalistItems = (treeData: Category[]): AutoCompleteItem [] => {
        let autoCompleteItems: AutoCompleteItem [] = []
        treeData.forEach(category => {
            if('childCategories' in category){
                autoCompleteItems = [...autoCompleteItems, ...buildDatalistItems(category.childCategories)]
            } else {
                if(buildDatalistItemFromBottomCategory(category))
                autoCompleteItems = [...autoCompleteItems, ...buildDatalistItemFromBottomCategory(category)]
            }
        })
        console.log(autoCompleteItems)
        return autoCompleteItems
    }

    /**
     * stores the full list of autocomplete items
    */
    const criteria : AutoCompleteItem [] = buildDatalistItems(treeData[0].childCategories)
    
    /**
     * stores the filtered list of autocomplete items
    */
    const inputOptions = writable<AutoCompleteItem[]>()
    
    /**
     * watches the input value and updates the input options
    */
    let inputValue = '';

    /**
     * watches the input value and updates the input options
    */
    $: $inputOptions = criteria.filter(item => 
        item.name.toLowerCase().includes(inputValue.toLowerCase())
        ||
        item.criterion.name.toLowerCase().includes(inputValue.toLowerCase())
        )


    /**
     * keeps track of the focused item index
     */
    let focusedItemIndex = 0

    /**
     * handles keyboard events to make input options selectable
     * @param event
     */
    const handleKeyDown = (event: KeyboardEvent) => {
        if(inputValue.length === 0 || event.key === 'Escape') {
            inputValue = ''
            focusedItemIndex = 0
            return
        }
        if(event.key === 'ArrowDown'){
            event.preventDefault()
            focusedItemIndex = focusedItemIndex + 1
            if (focusedItemIndex > $inputOptions.length - 1) focusedItemIndex = 0
        }
        if(event.key === 'ArrowUp'){
            event.preventDefault()
            focusedItemIndex = focusedItemIndex - 1
            if (focusedItemIndex < 0) focusedItemIndex = $inputOptions.length - 1
        }
        if(event.key === 'Enter'){
            event.preventDefault()
            queryStore.update(query => [...query, $inputOptions[focusedItemIndex]])
            focusedItemIndex = 0
            inputValue = ''
        }
    }

</script>
<div part="lens-searchbar" class="lens-searchbar" >
    <input part="lens-searchbar-input" class="lens-searchbar-input" type="text" bind:value={inputValue} on:keydown={handleKeyDown}/>
    {#if inputValue.length > 0}
    <ul part="lens-searchbar-autocomplete-options" class="lens-searchbar-autocomplete-options">
            {#if $inputOptions?.length > 0}
                {#each $inputOptions as inputOption, index}
                    <li 
                        part="lens-searchbar-autocomplete-options-item"
                        class="lens-searchbar-autocomplete-options-item"
                        class:lens-searchbar-autocomplete-options-item-focused={index === focusedItemIndex}
                    >
                        {inputOption.name} : {inputOption.criterion.name}
                    </li>
                {/each}
            {:else}
            <li>{noMatchesFoundMessage}</li>
            {/if}
        </ul>
    {/if}
</div>



<style>
    .lens-searchbar {
        position: relative;
    }
    .lens-searchbar-autocomplete-options-item-focused {
        color: coral;
    }
    .lens-searchbar-input {
        width: 100%;
        height: 100%;
        padding: 10px;
        border: solid 1px black;
    }
    .lens-searchbar-autocomplete-options {
        list-style-type: none;
        padding: 20px;
        margin: 0;
        border: solid 1px black;
        width: 300px;
        position: absolute;
        z-index: 1;
        background-color: white;
        color: black;
    }
</style>