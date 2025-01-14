import { writable } from "svelte/store";

/**
 * This channel is intended for user-facing error messages. You can write a
 * custom component that consumes the channel or use the <error-toasts />
 * component.
 * @example
 * // write to the channel
 * errorChannel.set('Something went wrong.');
 */
export const errorChannel = writable("");
