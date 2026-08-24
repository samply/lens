/**
 * Number of items rendered initially and appended each time the user scrolls to
 * the bottom of the list.
 */
const CHUNK_SIZE = 50;

/**
 * Distance in pixels from the bottom of the scroll container at which the next
 * chunk is appended, so that new items are ready before the user gets there.
 */
const PREFETCH_MARGIN = 200;

/**
 * Renders a long list of items in chunks, so that only a small part of it is in
 * the DOM at any time. This keeps result lists usable with catalogues that
 * contain thousands of entries.
 *
 * Usage: pass a getter for the full list, render `list.items` and put a sentinel
 * element with `use:list.sentinel` after the last item while `list.hasMore` is
 * true. The sentinel appends the next chunk as soon as it scrolls into view.
 * @param getItems - returns the full list of items, may be reactive state
 * @param chunkSize - how many items to render per chunk
 * @returns an object exposing the rendered items and the sentinel action
 */
export function createIncrementalList<T>(
    getItems: () => T[],
    chunkSize: number = CHUNK_SIZE,
) {
    let renderedCount = $state(chunkSize);
    const items = $derived(getItems().slice(0, renderedCount));
    const hasMore = $derived(renderedCount < getItems().length);

    function loadMore(): void {
        renderedCount = Math.min(renderedCount + chunkSize, getItems().length);
    }

    return {
        /** The items that should currently be rendered */
        get items(): T[] {
            return items;
        },
        /** Whether items of the full list are still waiting to be rendered */
        get hasMore(): boolean {
            return hasMore;
        },
        /** Number of items currently rendered */
        get renderedCount(): number {
            return items.length;
        },
        /** Shrinks the rendered window back to a single chunk, e.g. when the filter changes */
        reset(): void {
            renderedCount = chunkSize;
        },
        /**
         * Grows the rendered window until the given index is rendered. Needed
         * for keyboard navigation, which may move past the rendered items.
         * @param index - index into the full list that must be rendered
         */
        ensureRendered(index: number): void {
            if (index >= renderedCount) {
                renderedCount = Math.min(
                    Math.ceil((index + 1) / chunkSize) * chunkSize,
                    getItems().length,
                );
            }
        },
        /**
         * Svelte action for a sentinel element rendered after the last item.
         * Appends the next chunk whenever the sentinel comes into view, which
         * also fills the container if the first chunk is too short to scroll.
         * @param node - the sentinel element, must be a child of the scroll container
         * @returns the action lifecycle object
         */
        sentinel(node: HTMLElement) {
            let destroyed = false;
            const observer = new IntersectionObserver(
                (entries) => {
                    if (!entries.some((entry) => entry.isIntersecting)) return;
                    loadMore();
                    // The sentinel may still be visible after the new chunk was
                    // appended, in which case the observer would not report
                    // another intersection. Re-observing forces a fresh report
                    // so that the container keeps filling up.
                    observer.unobserve(node);
                    requestAnimationFrame(() => {
                        if (!destroyed) observer.observe(node);
                    });
                },
                {
                    root: node.parentElement,
                    rootMargin: `0px 0px ${PREFETCH_MARGIN}px 0px`,
                },
            );
            observer.observe(node);
            return {
                destroy(): void {
                    destroyed = true;
                    observer.disconnect();
                },
            };
        },
    };
}
