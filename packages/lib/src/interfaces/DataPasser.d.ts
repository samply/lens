// Create a TypeScript declaration file (LensDataPasser.d.ts)
interface LensDataPasser {
    getQuery(): QueryItem[][]; // Assuming QueryItem is defined somewhere
    setQuery(params: SetQueryParams): void;
  }
  
  export default LensDataPasser;