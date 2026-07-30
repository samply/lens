# The catalogue

The catalogue contains all possible query elements used in your search or exploration application. Lens expects a catalogue to be provided during initialization — even an empty one is valid.

The structure of the catalogue is defined in [schema](https://github.com/samply/lens/blob/develop/schema/catalogue.schema.json) and [type](https://samply.github.io/lens/docs/types/CatalogueInput.html). Validating your catalogue can be done within VS Code with the schema, see [here](./new-app.md#schema-validation).

## Loading catalogue parts from external files

Large parts of a catalogue — for example the list of ICD-10 diagnosis codes — are often shared between several Lens-based applications. Instead of copying them into every project's catalogue, you can keep them in a single external JSON file and reference that file from your catalogue. Lens fetches the file at runtime and splices its contents into the catalogue in place of the reference.

A reference is a node with `fieldType: "ref"` and a `url`. It can appear anywhere a regular catalogue item can — at the top level or inside a group's `childCategories`:

```jsonc
[
    {
        "fieldType": "group",
        "key": "diagnosis-group",
        "name": "Diagnosis",
        "childCategories": [
            {
                "fieldType": "ref",
                "url": "https://example.org/shared/icd10.json",
            },
        ],
    },
    {
        "fieldType": "single-select",
        "key": "sample-type",
        "name": "Sample type",
        "type": "EQUALS",
        "criteria": [],
    },
]
```

The referenced file must contain an **array of catalogue items** (the same shape as a catalogue), which replaces the reference node. A single reference can therefore expand to one or several categories:

```jsonc
// icd10.json — the shared single source of truth
[
    {
        "fieldType": "autocomplete",
        "key": "diagnosis",
        "name": "Diagnosis ICD-10",
        "type": "EQUALS",
        "criteria": [
            /* … the shared codes … */
        ],
    },
]
```

> **Note:** the `url` is fetched directly by the browser, so it must point at the raw JSON file and be served with permissive CORS headers — not at an HTML page that displays the file. On GitHub, for example, use the raw URL (`https://raw.githubusercontent.com/…`) rather than the repository page URL.

References are resolved by `setCatalogue`, which is asynchronous: the returned promise resolves once the catalogue — with all references replaced — has been set. Sibling references are fetched concurrently, and referenced files may themselves contain further references (resolved up to a small fixed nesting depth, which also guards against reference cycles).

If a referenced file cannot be loaded — the URL is unreachable, the response is not OK, or the payload does not conform to the catalogue schema — the reference is dropped, an error is logged to the browser console, and the rest of the catalogue is rendered as usual. A missing shared file therefore degrades gracefully rather than breaking the whole application.

## Subgroups

The catalogue supports the definition of [subgroups](https://samply.github.io/lens/docs/types/Criteria.html#subgroup). For example, you might group all patients with diabetes at the top level, while also distinguishing between different types of diabetes. If a user wants to find patients with _any_ form of diabetes, this can be expressed using subgroups in the catalogue.

Subgroups allow you to structure complex concepts in a way that supports both broad and narrow search criteria.
