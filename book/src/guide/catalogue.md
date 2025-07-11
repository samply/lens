# The catalogue

The **Catalogue** contains all possible query elements used in your search or exploration application. Lens expects a catalogue to be provided during initialization — even an empty one is valid.

The catalogue can either be:

- a local file included in your project, or
- fetched dynamically via a REST call.

**⚠️Important:** While it is technically possible to retrieve and modify the catalogue at runtime, this is not recommended.

The structure of the catalogue is defined in [schema](https://samply.github.io/lens/docs/types/AstBottomLayerValue.html) and [type](https://samply.github.io/lens/docs/types/Catalogue.html). Valdiating your catalogue can be done within VS Code with the schema, see [here](https://frontaid.io/blog/json-schema-vscode/).

### Subgroups

The catalogue supports the definition of [subgroups](https://samply.github.io/lens/docs/types/Criteria.html#subgroup). For example, you might group all patients with diabetes at the top level, while also distinguishing between different types of diabetes. If a user wants to find patients with _any_ form of diabetes, this can be expressed using subgroups in the catalogue.

Subgroups allow you to structure complex concepts in a way that supports both broad and narrow search criteria.

### Recommended function for fetching:

```ts
/**
 * Fetches the catalogue and options file from the given URLs.
 * @param catalogueUrl The URL of the catalogue.
 * @param optionsUrl The URL or path of the options file.
 * @returns A promise that resolves to an object containing the catalogue and options as JSON strings
 */
export const fetchData = async (
    catalogueUrl: string,
    optionsUrl: string,
): Promise<{ catalogueJSON: string; optionsJSON: string }> => {
    const cataloguePromise: string = await fetch(catalogueUrl).then(
        (response) => response.text(),
    );

    const optionsPromise: string = await fetch(optionsUrl).then((response) =>
        response.text(),
    );

    return Promise.all([cataloguePromise, optionsPromise]).then(
        ([catalogueJSON, optionsJSON]) => {
            return { catalogueJSON, optionsJSON };
        },
    );
};
```

### Svelte integration

If you're using Svelte, we recommend starting with this structure:

```ts
const jsonPromises: Promise<{
    catalogueJSON: string;
    optionsJSON: string;
}> = fetchData(catalogueUrl, optionsFilePath);
```

```svelte
{#await jsonPromises}
    <p>Loading data...</p>
{:then { optionsJSON, catalogueJSON }}
    <lens-options {catalogueJSON} {optionsJSON} {measures}></lens-options>
{:catch someError}
    System error: {someError.message}
{/await}
```

---
