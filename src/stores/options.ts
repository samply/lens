import { writable } from "svelte/store";
import type { LensOptions } from "../types/options";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import optionsSchema from "../../schema/options.schema.json";

// This is undefined on startup and is populated when the application calls setOptions
export const lensOptions = writable<LensOptions | undefined>();

/**
 * Set the options. A warning is logged to the browser console if the options do not match the JSON schema. Note that the function makes a deep copy of the options so modifying the original object has no effect.
 */
export function setOptions(newOptions: LensOptions) {
    // Make a copy to avoid modifying the original object
    const optionsCopy = structuredClone(newOptions);
    const ajv = new Ajv({
        allErrors: true,
        removeAdditional: true,
    });
    addFormats(ajv);
    const valid = ajv.validate(optionsSchema, optionsCopy);
    if (!valid) {
        console.warn(
            "Options do not conform with JSON schema: " +
                JSON.stringify(ajv.errors),
        );
    }
    lensOptions.set(optionsCopy);
}
