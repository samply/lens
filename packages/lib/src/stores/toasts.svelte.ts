let errorToasts: { id: number; message: string }[] = $state([]);

let nextId = 0;

/**
 * Show an error toast
 * @param message The error message
 * @param timeout Timeout in milliseconds after which to remove the toast
 */
export function showError(message: string, timeout = 8000): void {
    const id = nextId++;
    errorToasts.push({ id, message });

    // Auto-remove the toast after timeout
    setTimeout(() => {
        removeToast(id);
    }, timeout);
}

/**
 * Return the visibile error toasts
 * @returns The error toasts that are currently visible
 */
export function getToasts(): { id: number; message: string }[] {
    return errorToasts;
}

/**
 * Remove an error toast
 * @param id Id of the error toast to remove
 */
export function removeToast(id: number): void {
    errorToasts = errorToasts.filter((t) => t.id !== id);
}
