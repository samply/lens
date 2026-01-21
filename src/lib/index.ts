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
    selectSite,
    unselectSite,
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

// Export Svelte components
export { default as Catalogue } from "./components/catalogue/Catalogue.svelte";
export { default as SearchBar } from "./components/search-bar/SearchBarComponent.svelte";
export { default as SearchButton } from "./components/buttons/SearchButtonComponent.svelte";
export { default as Chart } from "./components/results/ChartComponent.svelte";
export { default as ResultSummary } from "./components/results/ResultSummaryComponent.svelte";
export { default as ResultTable } from "./components/results/ResultTableComponent.svelte";
export { default as SearchBarMultiple } from "./components/search-bar/SearchBarMultipleComponent.svelte";
export { default as NegotiateButton } from "./components/buttons/NegotiateButtonComponent.svelte";
export { default as InfoButton } from "./components/buttons/InfoButtonComponent.svelte";
export { default as QueryExplainButton } from "./components/buttons/QueryExplainButtonComponent.svelte";
export { default as SearchModifiedDisplay } from "./components/informational/ModifiedSearchComponent.svelte";
export { default as QuerySpinner } from "./components/informational/QuerySpinner.svelte";
export { default as Toasts } from "./components/informational/Toasts.svelte";
export { default as AboutLens } from "./components/informational/AboutLensComponent.svelte";

import "./styles/index.css";
