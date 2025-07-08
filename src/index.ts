// This file is the entry point for the Vite bundler. Everything that is
// re-exported here appears in the bundle and is part of the public API.

// Export functions
export { setCatalogue } from "./stores/catalogue";
export { setOptions } from "./stores/options";
export { setMeasures } from "./stores/measures";
export { translate } from "./helpers/translations";
export { showErrorToast } from "./stores/toasts";
export { resetDiagrams } from "./services/reset";
export {
    addItemToActiveQueryGroup,
    setQueryStore,
    getQueryStore,
    addStratifierToQuery,
    setQueryStoreFromAst,
} from "./stores/query";
export {
    setSiteResult,
    markSiteClaimed,
    measureReportToSiteResult,
    clearSiteResults,
    type SiteResult,
} from "./stores/response";
export { getAst } from "./helpers/ast-transformer";

// export temporarily, this will hopefully be moved to CCP explorer before 0.6.0 release
export { translateAstToCql } from "./cql-translator-service/ast-to-cql-translator";
export { buildLibrary, buildMeasure } from "./helpers/cql-measure";

// Export backends
export { createBeamTask, type BeamResult } from "./backends/spot";
export { Blaze } from "./backends/blaze";

// Export types
export type * from "./types/ast";
export type * from "./types/catalogue";
export type * from "./types/options";
export type {
    MeasureItem,
    Measure,
    MeasureGroup,
    ResponseStore,
    MeasureStore,
} from "./types/backend";
export type { SiteData, Site } from "./types/response";
export type { QueryItem, QueryValue } from "./types/queryData";
export type { AddStratifierParams } from "./stores/query";

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
import "./components/Options.wc.svelte";
import "./components/informational/ModifiedSearchComponent.wc.svelte";
import "./components/informational/QuerySpinner.wc.svelte";
import "./components/ErrorToasts.wc.svelte";

// Include CSS in the bundle
import "./styles/index.css";
