# Querying a backend

In `samply/lens`, there are three important structures for building a query:

- Catalogue
- Query Data
- Lens-AST (Abstract Syntax Tree)

---

## Query Data

Once a user selects an element from the catalogue, it is added to the query store. Like the catalogue, query elements can also be added programmatically using [setQueryStoreAPI](https://samply.github.io/lens/docs/interfaces/LensDataPasser.html#setquerystoreapi).

Query Data is the internal representation of the user's current query. It contains all necessary information required to construct the final query output.

---

## Lens-AST

To allow external systems (e.g., databases or APIs) to understand the query, the internal Query Data is transformed into the **Lens-AST**.

AST stands for Abstract Syntax Tree. It represents the query in a structured, hierarchical format that is decoupled from the original catalogue.

The root of the AST is an [types](https://samply.github.io/lens/docs/types/AstElement.html). It defines the overall logical structure using one of the following operators:

```
"AND" | "OR" | "XOR" | "NOT"
```

The `children` of an [types](https://samply.github.io/lens/docs/types/AstElement.html) can be either another [types](https://samply.github.io/lens/docs/types/AstElement.html) or an https://samply.github.io/lens/docs/types/AstBottomLayerValue.html. An [`AstBottomLayerValue`](https://samply.github.io/lens/docs/types/AstBottomLayerValue.html) contains the actual filter expressions — for example, `gender = male`.

### Empty Query

Since Lens is designed for exploratory querying, it supports an **empty query**, which returns _all_ available data. In this case, Lens generates the following AST:

```json
{
    "operand": "OR",
    "children": []
}
```

---

## AST Example

The AST types are located in [types](https://samply.github.io/lens/docs/types/AstElement.html). Here's an example of a more complex query structure:

```json
{
    "operand": "OR",
    "children": [
        {
            "operand": "AND",
            "children": [
                {
                    "key": "gender",
                    "operand": "OR",
                    "children": [
                        {
                            "key": "gender",
                            "type": "EQUALS",
                            "system": "",
                            "value": "male"
                        }
                    ]
                }
            ]
        }
    ]
}
```

This AST includes two nested [AstTopLayer](https://samply.github.io/lens/docs/types/AstTopLayer.html) objects with `OR` and `AND` operators. The inner [AstTopLayer](https://samply.github.io/lens/docs/types/AstTopLayer.html) contains a `key`, indicating that its children are logically grouped under this key — in this case, `gender`.

This layer provides context for the query at the database level. In the deepest `children` array, we see the actual condition: we are searching for patients whose gender is equal to "male".

---

### Converting Query Data to AST

To send a query to a database or external service, you can subscribe to the query store to get the current state, then convert it to an AST using:

```ts
const ast = buildAstFromQueryStore(queryStore);
```

---

### Handling Subgroups in AST

If your catalogue includes subgroups, we recommend expanding them in the query before processing. This can be done easily using:

```ts
const astWithSubCategories = resolveAstSubCategories(ast);
```

This function replaces subgroup references with their actual sub-elements, making the query explicit and ready for processing.
