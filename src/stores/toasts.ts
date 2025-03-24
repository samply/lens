import { writable } from "svelte/store";

export const errorToasts = writable<{ id: number; message: string }[]>([]);

let nextId = 0;

/**
 * Show an error toast
 * @param message The error message
 * @param timeout Timeout in milliseconds after which to remove the toast
 */
export function showErrorToast(message: string, timeout = 8000): void {
    const id = nextId++;
    errorToasts.update((toasts) => [...toasts, { id, message }]);

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
    errorToasts.update((toasts) => toasts.filter((t) => t.id !== id));
}
