<svelte:options customElement="lens-query-display" />

<script lang="ts">
    import { queryStore } from "../../stores/query";
    import { dndzone } from "svelte-dnd-action";
    import { flip } from "svelte/animate";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import { v4 as uuidv4 } from "uuid";

    /**
     * updates the store with the new order of items if the user is still dragging
     * @param e
     * @param index
     */
    const handleDndConsider = (e: CustomEvent, index: number) => {
        queryStore.update((store) => {
            store[index] = e.detail.items;
            return store;
        });
    };

    /**
     * updates the store with the new order of items if the user has finished dragging
     * and merges duplicate objects
     * @param e
     * @param index
     */
    const handleDndFinalize = (e: CustomEvent, index: number) => {
        let newGroup: QueryItem[] = e.detail.items;

        const duplicateObjects: QueryItem[] = findObjectsWithSameName(newGroup);

        let newObjectFromDuplicates: QueryItem;

        if (duplicateObjects !== undefined) {
            newObjectFromDuplicates = {
                id: uuidv4(),
                key: duplicateObjects[0].key,
                name: duplicateObjects[0].name,
                values: [],
            };

            /**
             * merges the values of the duplicate objects
             */
            duplicateObjects.forEach((obj: QueryItem) => {
                obj.values.forEach((value: QueryValue) => {
                    if (
                        !newObjectFromDuplicates.values.some(
                            (val: QueryValue) => val.name === value.name
                        )
                    ) {
                        newObjectFromDuplicates.values.push(value);
                    }
                });
            });
        }

        queryStore.update((store) => {
            if (newObjectFromDuplicates !== undefined) {
                newGroup = newGroup.filter(
                    (item) => item.name !== newObjectFromDuplicates?.name
                );
                newGroup.push(newObjectFromDuplicates);
            }

            store[index] = newGroup;
            return store;
        });
    };

    /**
     * finds objects with the same name in an array
     * @param objectsArray
     * @returns QueryItem[]
     */
    function findObjectsWithSameName(objectsArray: QueryItem[]) {
        const nameObjectMap = new Map<string, QueryItem[]>();

        objectsArray.forEach((obj: QueryItem) => {
            const name = obj.name;
            if (nameObjectMap.has(name)) {
                nameObjectMap.get(name).push(obj);
            } else {
                nameObjectMap.set(name, [obj]);
            }
        });

        const duplicateObjects: QueryItem[] = Array.from(
            nameObjectMap.values()
        ).filter((objects: QueryItem[]) => objects.length > 1)[0];

        return duplicateObjects;
    }
</script>

<div part="query-display-wrapper">
    {#each $queryStore as queryGroup, index}
        <div part="query-display-group">
            <h4 part="query-display-group-heading">Sample Group {index + 1}</h4>
            <section
                part="query-display-group-section"
                use:dndzone={{
                    items: queryGroup,
                    flipDurationMs: 150,
                    centreDraggedOnCursor: true,
                }}
                on:consider={(e) => handleDndConsider(e, index)}
                on:finalize={(e) => handleDndFinalize(e, index)}
                dropTargetStyle={{
                    outline: "rgba(0, 255, 102, 0.7) solid 2px",
                }}
            >
                {#each queryGroup as item (item.id)}
                    <div
                        part="query-display-group-item"
                        animate:flip={{ duration: 150 }}
                    >
                        <b>{item.name}:</b>
                        {#each item.values as value, index}
                            <span
                                >{index === 0 ? "\b" : " or "} {value.name}
                            </span>
                        {/each}
                    </div>
                {/each}
            </section>
            <button
                part="query-display-remove-group-button"
                on:click={() =>
                    queryStore.update((store) =>
                        store.filter((item, i) => i !== index)
                    )}>Remove Group</button
            >
        </div>
    {/each}
    <!-- <div part="query-display-add-group-button"> -->
    <button
        part="query-display-add-group-button"
        on:click={() => queryStore.update((store) => [...store, []])}
        >&plus;</button
    >
    <!-- </div> -->
</div>

<style>
</style>
