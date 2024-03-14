<script lang="ts">
    /**
     * This component is part of the query tree.
     *
     * It allows a user to enter an arbitrary string without any kind of checking.
     *
     * It is needed for the EHDS2 pilot project.
     *
     * It has been copied and pasted from AutoCompleteComponent and probably contains
     * dead code that could be deleted or simplified. TODO: write own CSS.
     */
    import type { Category, Criteria } from "../../types/treeData";
    import { v4 as uuidv4 } from "uuid";
    import { addItemToQuery, queryStore } from "../../stores/query";
    import type { QueryItem, QueryValue } from "../../types/queryData";
    import AutoCompleteCriterionComponent from "./AutoCompleteCriterionComponent.svelte";
    import { onMount } from "svelte";
    import { addPercentageSignToCriteria } from "../../helpers/object-formaters";

    /**
     * mockdata to get from texts store
     */
    let placeholderText: string = "Enter filter term";

    export let element: Category;

    /**
     * list of criteria
     */
    let criteria: Criteria[] = "criteria" in element ? element.criteria : [];

    onMount(() => {
        /**
         * adds .% option to find all subgroups
         */
        criteria = addPercentageSignToCriteria(structuredClone(criteria));
    });

    /**
     * stores the filtered list of autocomplete items
     */
    let inputOptions: Criteria[] = [];

    /**
     * input element binds to this variable. Used to focus the input element
     */
    let searchBarInput: HTMLInputElement;
    /**
     * watches the input value and updates the input options
     */
    let inputValue: string = "";

    /**
     * list of options that allready have been chosen and should be displayed beneath the autocomplete input
     * chosenOptions are constructed from the query store and has no duplicates
     * if an option is put into the store from anywhere it will update
     */
    $: chosenOptions = getChosenOptionsFromQueryStore($queryStore).reduce(
        (acc: QueryItem[], queryItem: QueryItem) => {
            const optionAllreadyPresent = acc.find((option: QueryItem) => {
                return option.values[0].value === queryItem.values[0].value;
            });
            if (optionAllreadyPresent || queryItem.key !== element.key) {
                return acc;
            }
            return [...acc, queryItem];
        },
        [],
    );

    const getChosenOptionsFromQueryStore = (queryStore): QueryItem[] => {
        return queryStore
            .flat()
            .map((queryItem: QueryItem) => {
                const queryItemValues = queryItem.values.map(
                    (queryValue: QueryValue) => {
                        return {
                            ...queryItem,
                            values: [queryValue],
                        };
                    },
                );
                return queryItemValues;
            })
            .flat();
    };

    let activeDomElement: HTMLElement;

    /**
     * transforms the inputvalue to a QueryItem, adds it to the query store
     * and resets the input value and the focused item index
     * @param inputItem - the input item to add to the query store
     * @param indexOfChosenStore - the index of the chosen store to add the input item to
     */
    const addInputValueToStore = (
        inputItem: Criteria,
        indexOfChosenStore: number = 0,
    ): void => {
        /**
         * check if option is allready present in the query store
         */
        const optionAllreadyPresent = chosenOptions.find((option) => {
            return option.values[0].value === inputItem.key;
        });

        if (optionAllreadyPresent) {
            return;
        }

        /**
         * transform inputItem to QueryItem
         */
        const queryItem: QueryItem = {
            id: uuidv4(),
            name: element.name,
            key: element.key,
            type: "type" in element && element.type,
            values: [
                {
                    value: inputItem.key,
                    name: inputItem.name,
                    description: inputItem.description,
                    queryBindId: uuidv4(),
                },
            ],
        };

        inputValue = "";

        addItemToQuery(queryItem, indexOfChosenStore);
    };

    /**
     * handles keyboard events to make input options selectable
     * @param event - the keyboard event
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
        console.log(`handleKeyDown: entered`)
        console.log(`handleKeyDown: inputValue: ${inputValue}`)

        if (event.key === "Enter") {
            console.log(`handleKeyDown: return key pressed`)
            event.preventDefault();
            console.log(`handleKeyDown: set datavalue`)
            let datavalue: Criteria = {key: inputValue, name: inputValue, description: inputValue}
            console.log(`handleKeyDown: datavalue declared`)
            console.log(`handleKeyDown: datavalue: ${datavalue}`)
            addInputValueToStore(datavalue);
        }
        console.log(`handleKeyDown: finished`)
    };

    /**
     * scrolls the active dom element into view when it is out of view
     * @param activeDomElement - the active dom element
     */
    const scrollInsideContainerWhenActiveDomElementIsOutOfView = (
        activeDomElement,
    ): void => {
        if (!activeDomElement) return;
        const container: HTMLElement = activeDomElement.parentElement;
        const containerTop: number = container.scrollTop;
        const containerBottom: number = containerTop + container.clientHeight;
        const elementTop: number = activeDomElement.offsetTop;
        const elementBottom: number =
            elementTop + activeDomElement.clientHeight;

        if (elementTop < containerTop) {
            container.scrollTop = elementTop;
        } else if (elementBottom > containerBottom) {
            container.scrollTop = elementBottom - container.clientHeight;
        }
    };

    $: scrollInsideContainerWhenActiveDomElementIsOutOfView(activeDomElement);
</script>

<div part="autocomplete-container">
    <div part="autocomplete-formfield">
        <input
            part="autocomplete-formfield-input"
            type="text"
            bind:this={searchBarInput}
            bind:value={inputValue}
            on:keydown={handleKeyDown}
            placeholder={placeholderText}
        />
    </div>
    <div part="criterion-wrapper autocomplete-wrapper">
        {#each chosenOptions as chosenOption}
            <AutoCompleteCriterionComponent {chosenOption} />
        {/each}
    </div>
</div>
