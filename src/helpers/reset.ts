import { clearSiteResults } from "../stores/response";

/**
 * Resets the diagrams and clears the response store.
 */
export function resetDiagrams() {
    // clear site results
    clearSiteResults();
    // Reset the charts
    const charts = document.querySelectorAll("lens-chart");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    charts.forEach((chart: any) => {
        chart.resetChart?.();
    });
}

export function resetSearchBarTextInputs() {
    const event = new CustomEvent("reset-all-searchbar-inputs");
    window.dispatchEvent(event);
}
