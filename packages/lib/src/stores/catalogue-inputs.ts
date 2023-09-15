import { writable } from "svelte/store";
import type { QueryItem, QueryValue } from "../types/queryData";
import { v4 as uuidv4 } from "uuid";


export const numberInputComponents = writable<QueryValue[]>([]);


const createEmptyNumberInput = (key: string ,name: string): QueryValue => {
    const newItem = {
        name: `From 0 to 0`,
        value: { min: 0, max: 0 },
        queryBindId: uuidv4(),
    };
    return newItem;
};

export const addNumberInputComponent = (key: string, name: string): void => {

    numberInputComponents.update((numberInputs) => {
        const newItem = createEmptyNumberInput(key, name);
        console.log(newItem);
        return [...numberInputs, newItem];
    });
};

export const removeNumberInputComponent = (queryItem: QueryItem): void => {
    queryItem = Object.assign({}, queryItem);

    console.log(queryItem.values[0].queryBindId)
    numberInputComponents.update((numberInputs) => {
        numberInputs = numberInputs.filter((numberInput) => numberInput.queryBindId !== queryItem.values[0].queryBindId);
        return numberInputs;
    });
}