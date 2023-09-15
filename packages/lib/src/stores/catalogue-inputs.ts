import { writable } from "svelte/store";
import type { QueryItem, QueryValue } from "../types/queryData";
import { v4 as uuidv4 } from "uuid";


export const numberInputComponents = writable<QueryValue[]>([]);


export const addNumberInputComponent = (key: string, name: string): void => {

    numberInputComponents.update((numberInputs) => {
        return [...numberInputs, {
            name: `From 0 to 0`,
            value: { min: 0, max: 0 },
            queryBindId: uuidv4(),
        }];
    });
};

export const removeNumberInputComponent = (componentId: string): void => {
    console.log(componentId)

    numberInputComponents.update((numberInputs) => {
        return [...numberInputs.filter((numberInput) => numberInput.queryBindId !== componentId)]
    });
}