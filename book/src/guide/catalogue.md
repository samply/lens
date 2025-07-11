# The catalogue

The **Catalogue** contains all possible query elements used in your search or exploration application. Lens expects a catalogue to be provided during initialization — even an empty one is valid.

The catalogue can either be:

- a local file included in your project, or
- fetched dynamically via a REST call.

The structure of the catalogue is defined in [schema](https://github.com/samply/lens/blob/develop/schema/catalogue.schema.json) and [type](https://samply.github.io/lens/docs/types/Catalogue.html). Valdiating your catalogue can be done within VS Code with the schema, see [here](./new-app.md#schema-validation).

### Subgroups

The catalogue supports the definition of [subgroups](https://samply.github.io/lens/docs/types/Criteria.html#subgroup). For example, you might group all patients with diabetes at the top level, while also distinguishing between different types of diabetes. If a user wants to find patients with _any_ form of diabetes, this can be expressed using subgroups in the catalogue.

Subgroups allow you to structure complex concepts in a way that supports both broad and narrow search criteria.

### Recommended function for fetching:

```ts
async function fetchCatalogue() {
    const catalogue: Catalogue = await fetch(catalogueUrl).then((response) =>
        response.json(),
    );
    setCatalogue(catalogue);
}
```
