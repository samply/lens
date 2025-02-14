import type { AstTopLayer } from "./ast";
import type { ResponseStore } from "./backend";
import type { QueryItem, QueryValue } from "./queryData";
import type { Category } from "./treeData";

export type AddStratifierToQueryAPIParams = {
    label: string;
    catalogueGroupCode: string;
    groupRange?: number;
    queryGroupIndex?: number;
    system?: string;
};

export type RemoveItemFromQuyeryAPIParams = {
    queryObject: QueryItem;
    queryGroupIndex?: number;
};

export type RemoveValueFromQueryAPIParams = {
    queryItem: QueryItem;
    value: QueryValue;
    queryGroupIndex?: number;
};

export interface LensDataPasser extends HTMLElement {
    getQueryAPI(): QueryItem[][];
    getResponseAPI(): ResponseStore;
    getAstAPI(): AstTopLayer;
    getCriteriaAPI(category: string): string[];
    addStratifierToQueryAPI(params: AddStratifierToQueryAPIParams): void;
    removeItemFromQuyeryAPI(params: RemoveItemFromQuyeryAPIParams): void;
    removeValueFromQueryAPI(params: RemoveValueFromQueryAPIParams): void;
    updateResponseAPI(params: ResponseStore): void;
    setQueryStoreAPI(params: QueryItem[][]): void;
    setQueryStoreFromAstAPI(params: AstTopLayer): void;
    getCatalogueAPI(): Category[];
}
