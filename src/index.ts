// This file is the entry point for the Vite bundler. Everything that is
// re-exported here appears in the bundle and is part of the public API.

// Export functions
export { setCatalogue } from "./stores/catalogue";
export { setOptions } from "./stores/options";
export { translate } from "./helpers/translations";
export { showToast } from "./stores/toasts";
export { resetDiagrams } from "./helpers/reset";
export {
    addItemToActiveQueryGroup,
    setQueryStore,
    getQueryStore,
} from "./stores/query";
export { setQueryStoreFromAst } from "./helpers/ast-to-query";
export {
    setSiteResult,
    markSiteClaimed,
    removeFailedSite,
    measureReportToLensResult,
    clearSiteResults,
    type LensResult,
} from "./stores/response";
export { getAst } from "./helpers/ast-transformer";
export {
    buildLibrary,
    buildMeasure,
    type BuildLibraryReturn,
    type BuildMeasureReturn,
} from "./helpers/cql-measure";
export {
    getSelectedSites,
    setSiteAsSelected,
    removeSelectedSite,
    getHumanReadableQuery,
    getHumanReadableQueryAsFormattedString,
} from "./stores/datarequests";

export { setFacetCounts } from "./stores/facetCounts";

// Export backends
export { querySpot, type SpotResult } from "./backends/spot";

// Export types
export type * from "./types/ast";
export type * from "./types/catalogue";
export type * from "./types/options";
export type { FacetCounts } from "./stores/facetCounts";
export type { FhirMeasureItem, FhirMeasure } from "./types/backend";
export type { FhirMeasureReport } from "./types/response";
export type { QueryItem, QueryValue } from "./types/queryData";

// Include custom elements (aka web components) in the bundle
import "./components/catalogue/Catalogue.wc.svelte";
import "./components/search-bar/SearchBarComponent.wc.svelte";
import "./components/buttons/SearchButtonComponent.wc.svelte";
import "./components/results/ChartComponent.wc.svelte";
import "./components/results/ResultSummaryComponent.wc.svelte";
import "./components/results/ResultTableComponent.wc.svelte";
import "./components/search-bar/SearchBarMultipleComponent.wc.svelte";
import "./components/buttons/NegotiateButtonComponent.wc.svelte";
import "./components/buttons/InfoButtonComponent.wc.svelte";
import "./components/buttons/QueryExplainButtonComponent.wc.svelte";
import "./components/informational/ModifiedSearchComponent.wc.svelte";
import "./components/informational/QuerySpinner.wc.svelte";
import "./components/informational/Toasts.wc.svelte";
import "./components/informational/aboutLensComponent.svelte";

// Include CSS in the bundle
import "./styles/index.css";
