import { writable } from "svelte/store";
import type { LensOptions } from "../types/options";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import optionsSchema from "../../../../schema/options.schema.json";

// This is undefined on startup and is populated when the application calls setOptions
export const lensOptions = writable<LensOptions | undefined>();

/**
 * Set the options. An exception is thrown if the options do not match the JSON schema.
 */
export function setOptions(options: LensOptions) {
    const ajv = new Ajv({
        allErrors: true,
    });
    addFormats(ajv);
    const valid = ajv.validate(optionsSchema, options);
    if (valid) {
        lensOptions.set(options);
    } else {
        throw new Error(
            "Options not conform with JSON schema: " +
                JSON.stringify(ajv.errors),
        );
    }
}
