<svelte:options customElement="lens-query-display" />

<script>
    import { queryStore } from "../../stores/query";
    import { dndzone } from "svelte-dnd-action";
    import {flip} from "svelte/animate";


    function handleDndConsider(e, index) {
        let items = e.detail.items;
        queryStore.update((store) => {
            store[index] = items;
            return store;
        });
    }
    function handleDndFinalize(e, index) {
        let newGroupItems = e.detail.items;

        let storedItems = []

        newGroupItems.forEach(newGroupItem => {
            if(storedItems.find(item => item.name === newGroupItem.name) === undefined){
                storedItems.push(newGroupItem)
            } else {
                storedItems = storedItems.map(item => {
                    if(item.name === newGroupItem.name){
                        return {...item, values: [...new Set( [...item.values, ...newGroupItem.values] )]}
                    } else {
                        return item
                    }
                })
            }

        });

        queryStore.update((store) => {
            store[index] = storedItems;
            return store;
        });
    }

</script>

<div class="wrapper">
    {#each $queryStore as queryGroup, index}
        <div class="group">
            <h3>Sample Group {index+1}</h3>
            <section
                use:dndzone={{ items: queryGroup, flipDurationMs: 150 }}
                on:consider={(e) => handleDndConsider(e, index)}
                on:finalize={(e) => handleDndFinalize(e, index)}
                dropTargetStyle={{outline: 'rgba(0, 255, 102, 0.7) solid 2px'}}
                
            >
                {#each queryGroup as item (item.id)}
                    <div class="item" animate:flip="{{duration: 150}}">
                        {item.name}:
                        {#each item.values as value}
                            <span>{' '} {value.name}, </span>
                        {/each}
                    </div>
                {/each}
            </section>
            <div class="removeCurrentGroup">
                <button on:click={() => queryStore.update(store => store.filter((item, i) => i !== index))}>Remove Group</button>
            </div>
        </div>
    {/each}
    <div class="addGroup">
        <button on:click={() => queryStore.update(store => [...store, []])}>Add Group</button>
    </div>
</div>
