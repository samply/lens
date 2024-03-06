export interface LensDataPasser extends HTMLElement {
    getQueryAPI(): QueryItem[][];
    getResponseAPI(): ResponseStore;
    getAstAPI(): AstTopLayer;
    getCriteriaAPI(category: string): string[];
    addStratifierToQueryAPI(params: addStratifierToQueryAPIParams): void;
    removeItemFromQuyeryAPI(params: removeItemFromQuyeryAPIParams): void;
    removeValueFromQueryAPI(params: removeValueFromQueryAPIParams): void;
    updateResponseAPI(params: ResponseStore): void;
}
