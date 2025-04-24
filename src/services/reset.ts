import { clearResponseStore } from "../stores/response";

/**
 * Resets the diagrams and clears the response store.
 */
export function resetDiagrams() {
    // clear resonseStore
    clearResponseStore();
    // Reset the charts
    const charts = document.querySelectorAll("lens-chart");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    charts.forEach((chart: any) => {
        chart.resetChart?.();
    });
}
