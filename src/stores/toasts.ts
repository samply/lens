import { writable } from "svelte/store";

export const toasts = writable<
    { id: number; typ: "error" | "info"; message: string }[]
>([]);

let nextId = 0;

/**
 * Show an toast
 * @param message The message
 * @param typ Which typ of toast should be shown, either error or info
 * @param timeout Timeout in milliseconds after which to remove the toast
 */
export function showToast(
    message: string,
    type: "error" | "info",
    timeout = 8000,
): void {
    const id = nextId++;
    toasts.update((toasts) => [...toasts, { id, typ, message }]);

    // Auto-remove the toast after timeout
    setTimeout(() => {
        removeToast(id);
    }, timeout);
}

/**
 * Remove an error toast
 * @param id Id of the error toast to remove
 */
export function removeToast(id: number): void {
    toasts.update((toasts) => toasts.filter((t) => t.id !== id));
}
