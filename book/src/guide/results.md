# Showing results

## Lens result format

When your application has [queried a backend](query.md) and receives results from sites, it has to pass these results to Lens so it can display them. Lens expects results of type [`LensResult`](https://samply.github.io/lens/docs/types/LensResult.html), for example:

```json
{
    "stratifiers": {
        "gender": {
            "female": 31,
            "male": 43
        },
        "diagnosis": {
            "C34.0": 26,
            "C34.2": 28,
            "C34.8": 25
        }
    },
    "totals": {
        "patients": 74,
        "samples": 312
    }
}
```

The `totals` field contains the total number of patients, samples, etc. The `stratifiers` field contains stratum counts (e.g. male, female) for each stratifier (e.g. gender). The specific stratifiers depend on the application. When you add a chart to your application you specify which stratifier it should display.

[Focus](https://github.com/samply/focus) can return the Lens result format directly. If you are quering a FHIR server you can convert a FHIR measure report to the Lens result format using the [`measureReportToLensResult`](https://samply.github.io/lens/docs/functions/measureReportToLensResult.html) function.

## Passing results to Lens

You pass results to Lens using the [`setSiteResult`](file:///home/tim/projects/lens/docs/functions/setSiteResult.html) function. Before you pass a result you may call [`markSiteClaimed`](https://samply.github.io/lens/docs/functions/markSiteClaimed.html) to indicate that the site is available and will deliver results soon. If a site that was claimed fails you can use [`removeFailedSite`](https://samply.github.io/lens/docs/functions/removeFailedSite.html) to hide the site from the result summary and result table and remove the site out of the resultstore. This examples shows how you would pass results from Focus to Lens.

```ts
querySpot(query, abortController.signal, (result: SpotResult) => {
    const site = result.from.split(".")[1];
    if (result.status === "claimed") {
        markSiteClaimed(site);
    } else if (result.status === "succeeded") {
        const siteResult = JSON.parse(atob(result.body));
        setSiteResult(site, siteResult);
    } else {
        removeFailedSite(site);
        console.error(
            `Site ${site} failed with status ${result.status}:`,
            result.body,
        );
    }
});
```

### Handling Empty Query Results

Sometimes a query may succeed but return no data, with totals of `0` and empty stratifiers. In these cases, it’s recommended to check for an empty result and inform the user.

Include this function:

```ts
export function isLensResultEmpty(result: LensResult): boolean {
    // Check for non-empty stratifiers
    for (const stratifier of Object.values(result.stratifiers)) {
        if (Object.keys(stratifier).length > 0) return false;
    }

    // Check for non-zero totals
    for (const value of Object.values(result.totals)) {
        if (value !== 0) return false;
    }

    return true;
}
```

And check in your result function:

```ts
if (isLensResultEmpty(result)) {
    showToast("No results found for your query", "info");
}
```

## Components

Lens provides components to render results.

- [Result Table](../components/resulttable.md)
- [Result Summary](../components/resultsummary.md)
- [Chart](../components/chart.md)
