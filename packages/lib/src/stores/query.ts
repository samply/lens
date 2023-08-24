/**
    * Handles the state of the query
    * Consists of multiple arrays which will have an 'or' logic between them later when the query is sent to the server
*/

import { writable } from "svelte/store";

export const queryStore = writable([]);

