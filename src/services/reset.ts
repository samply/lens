import { clearQuery } from "../stores/query";
import { clearResponseStore } from "../stores/response";

export function resetDiagrams() {
    //clear searchquery
    clearQuery();
    // clear resonseStore
    clearResponseStore();
    // Reset the charts
    const charts = document.querySelectorAll("lens-chart");
    charts.forEach((chart: any) => {
        console.log(chart);
        chart.resetChart?.();
    });
}
