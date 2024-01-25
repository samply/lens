interface LensDataPasser {
  getQueryAPI(): QueryItem[][];
  addStratifierToQueryAPI(params: addStratifierToQueryAPIParams): void;
  removeItemFromQuyeryAPI(params: removeItemFromQuyeryAPIParams): void;
  removeValueFromQueryAPI(params: removeValueFromQueryAPIParams): void;
  getResponseAPI(): ResponseStore;
  getAstAPI(): AstTopLayer;
}
  
export default LensDataPasser;