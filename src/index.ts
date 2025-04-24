// This file is the entry point for the Vite bundler. Everything that is
// re-exported here appears in the bundle and is part of the public API.

// Export functions
export { setCatalogue } from "./stores/catalogue";
export { setOptions } from "./stores/options";
export { setMeasures } from "./stores/measures";
export { translate } from "./helpers/translations";
export { showErrorToast } from "./stores/toasts";
export { resolveAstSubCategories } from "./stores/catalogue";

// Export classes

export { Spot } from "./classes/spot";
export { Blaze } from "./classes/blaze";

// Export types
export type * from "./types/ast";
export type * from "./types/catalogue";
export type * from "./types/options";
export type {
    LensDataPasser,
    AddStratifierToQueryAPIParams,
    RemoveItemFromQuyeryAPIParams,
    RemoveValueFromQueryAPIParams,
} from "./types/dataPasser";
export type {
    MeasureItem,
    Measure,
    MeasureGroup,
    ResponseStore,
    MeasureStore,
} from "./types/backend";
export type { SiteData, Site } from "./types/response";
export type { BeamResult } from "./types/spot";
export type { QueryEvent } from "./types/queryEvent";
export type { QueryItem, QueryValue } from "./types/queryData";

// Include custom elements (aka web components) in the bundle
import "./components/catalogue/Catalogue.wc.svelte";
import "./components/search-bar/SearchBarComponent.wc.svelte";
import "./components/testing-components/StateDisplayComponent.wc.svelte";
import "./components/buttons/SearchButtonComponent.wc.svelte";
import "./components/results/ChartComponent.wc.svelte";
import "./components/results/ResultSummaryComponent.wc.svelte";
import "./components/results/ResultTableComponent.wc.svelte";
import "./components/search-bar/SearchBarMultipleComponent.wc.svelte";
import "./components/buttons/NegotiateButtonComponent.wc.svelte";
import "./components/buttons/InfoButtonComponent.wc.svelte";
import "./components/Options.wc.svelte";
import "./components/DataPasser.wc.svelte";
import "./components/informational/ModifiedSearchComponent.wc.svelte";
import "./components/informational/QuerySpinner.wc.svelte";
import "./components/ErrorToasts.wc.svelte";

// Include CSS in the bundle
import "./styles/index.css";
