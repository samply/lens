import type { Ast } from '../types/ast';
import type { QueryItem, QueryValue } from '../types/queryData';

/**
 * builds an AST from the query store
 * @param queryStore 
 * @returns Ast: the AST will later be converted to a query language of choice
 */
export const buildAstFromQuery = (queryStore): Ast => {

  let ast: Ast = {
    operand: 'OR',
    children: queryStore.map((queryGroup: QueryItem[]) => ({
      operand: 'AND',
      children: queryGroup.map((queryItem: QueryItem) => ({
        operator: 'OR',
        children: queryItem.values.map((queryValue: QueryValue) =>
          ({
            key: queryItem.name,
            type: queryItem.type,
            system: queryItem.system || '',
            value: queryValue.value,
          })
        ),
      }))
    }))
  }

  console.log(JSON.stringify(ast, null, 2));
  return ast;
}
