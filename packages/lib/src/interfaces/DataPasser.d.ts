interface LensDataPasser {
    getQuery(): QueryItem[][];
    setQuery(params: SetQueryParams): void;
  }
  
export default LensDataPasser;