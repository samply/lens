**Proposed Demo Redesign Plan (Before Implementation)**

I reviewed the English MII IG content in `lens/mii/full-ig/site/en/` and the current Lens demo wiring in `lens/demo-catalogue.json` and `lens/demo.svelte`.

### 1. MII module baseline to use
From `lens/mii/full-ig/site/en/index.md` and `lens/mii/full-ig/site/en/profiles-and-extensions.md`, the **base modules** in this package are:

1. Person
2. Treatment Case
3. Diagnosis
4. Procedure

Main profiles to anchor the demo:

1. `MII PR Person Patient` (`Patient`)
2. `MII PR Person Vitalstatus` (`Observation`)
3. `MII PR Diagnose Condition` (`Condition`)
4. `MII PR Prozedur Procedure` (`Procedure`)

Technical profile extensions present in this package:

1. Procedure intent (`Durchfuehrungsabsicht`)

For the demo scope, we explicitly exclude Treatment Case/Encounter content for now to keep a clear separation between diagnosis-centric and procedure-centric filtering.
Treatment Case is part of the MII base modules, but intentionally out of scope for this demo iteration.

Note: the local `mii` directory is the **base IG package**; it does not include full separate extension-module IGs (like full oncology/lab IG packages). For Lens domain demonstration, we can still model “optional extension-like domains” with clear labeling.

### 2. Field set to reflect in catalogue (prominent/important)
Based on profile differentials (required/must-support emphasis), we should represent these fields:

1. **Person / Patient**
   - `gender`
   - `birthDate` (or age abstraction)
   - identifier/pseudonym
   - vital status (via Vitalstatus profile)

2. **Diagnosis / Condition**
   - diagnosis code (ICD-10-GM must be prominent)
   - onset (date/period/age abstraction)
   - recorded date
   - body site (optional)
   - verification status (optional but useful)

3. **Procedure**
   - procedure code (OPS/SNOMED conceptually, but keep concise)
   - performed date/time
   - category
   - procedure intent (optional extension field)

### 3. Target catalogue structure (MII-aligned, oncology-focused)
Replace current mixed demo content with module-based groups:

1. **Person Module**
   - `SelectElement`: Gender
   - `DateRangeElement`: Date of birth
   - `FreeTextElement`: Patient pseudonym/identifier
   - `SelectElement`: Vital status

2. **Diagnosis Module** (core oncology focus)
   - `AutocompleteElement`: ICD-10-GM diagnosis (prominent, includes C-codes)
   - `DateRangeElement`: Diagnosis date / onset
   - `NumericRangeElement`: Age at diagnosis
   - `SelectElement`: Diagnosis verification status (optional)

3. **Procedure Module**
   - `AutocompleteElement` or `SelectElement`: Procedure code/category (compact curated list)
   - `DateRangeElement`: Procedure date
   - `SelectElement`: Procedure intent (planned/performed) to showcase profile extension use

Procedure intent is included as a catalogue filter only and will not be shown as a dedicated result chart.

We will not include a Treatment Case module section in the demo catalogue for this iteration.

### 4. Lens domains as “extension module” simulation
Use domains for optional datasets (not universally available), as requested. Domains are interpreted as provider capabilities and are only shown/usable for sites that support them.

1. `Biobank Domain`
   - Purpose: represent providers that can return biosample-related counts in addition to clinical cohort counts.
   - Intended site capability: site has a specimen/biosample repository linked to patient-level clinical data.
   - Example domain-scoped filters:
     - Sample availability (`available`, `reserved`, `depleted`)
     - Sample material type (`blood`, `tissue`, `serum`, `plasma`)
     - Sample storage age in years (`NumericRangeElement`)
   - Demo behavior: only some fictional sites will claim this domain, explicitly showcasing optional participation.

2. `Oncology Domain`
   - Purpose: represent sites that support richer cancer-specific semantics beyond base diagnosis/procedure fields.
   - Intended site capability: oncology-focused coding depth (tumor entity refinements and curated cancer subsets).
   - Example domain-scoped filters:
     - Tumor entity preset selector (e.g., Lung, Breast, Colorectal, Prostate)
     - Oncology diagnosis subset shortcuts over ICD-10 (e.g., `C34.%`, `C50.%`, `C18.%`, `C61`)
     - Optional morphology/topography proxy selector for demonstration
   - Demo behavior: at least one site without this domain remains visible to emphasize that domain support is optional.

3. `Consent Domain`
   - Purpose: represent providers with structured research-consent metadata usable as a filter.
   - Intended site capability: consent records are digitally queryable and linked to patient cohorts.
   - Example domain-scoped filters:
     - Consent status (`consented`, `declined`, `withdrawn`)
     - Consent scope (`broad research`, `oncology only`, `biobank use`)
     - Consent recency (`DateRangeElement`)
   - Demo behavior: supported by a subset of sites, independent from Biobank support.

These domains will be assigned to selected catalogue elements via `domains`, while base Person/Diagnosis/Procedure filters remain domain-agnostic and always available.

### 5. Ensure all Lens element types remain covered
We will explicitly keep at least one of each:

1. `CatalogueGroup`
2. `SelectElement`
3. `AutocompleteElement` (ICD-10 mandatory)
4. `NumericRangeElement`
5. `DateRangeElement`
6. `FreeTextElement`

### 6. Result sites and naming cleanup
In `lens/demo.svelte`, replace current synthetic names (`Riverside`, `Summit`, `Site A...J`) with clearly fictional clinical institutions, for example:

1. Northbridge University Hospital
2. St. Isolde Oncology Center
3. Westhaven Clinical Campus
4. Aldermoor Medical Institute
5. Harborlight Cancer Clinic

All listed fictional sites should return successful results in the demo (no failing-site simulation).

Result data handling in the demo:

1. Demo result payloads are static and hardcoded for demonstration, i.e. independent from the submitted query.
2. Static results should be moved out of `demo.svelte` into a separate JSON file (single file containing all site results).
3. `demo.svelte` should load this JSON and feed Lens result APIs from that file.
4. A visible demo warning should be added to the UI, e.g. "Demo notice: results are static for demonstration purposes and do not reflect the active query."

### 7. Chart/result redesign (more sensible and feature-rich)
Use this concrete fixed chart set in the demo:

1. `Gender distribution`
   - Component: `lens-chart`
   - `chartType`: `pie`
   - `dataKey`: `gender`
   - Expected categories: `male`, `female`, `other`
   - Purpose: keep parity with current demo and show pie chart behavior.

2. `Age distribution (bucketed)`
   - Component: `lens-chart`
   - `chartType`: `bar`
   - `dataKey`: `age_bucket`
   - Buckets: `0-17`, `18-39`, `40-49`, `50-59`, `60-69`, `70+`
   - Axis labels: x=`Age bucket`, y=`Patients`
   - Purpose: clinically plausible population structure and bucketed stratifier support.

3. `Top oncology ICD-10 diagnoses`
   - Component: `lens-chart`
   - `chartType`: `bar`
   - `dataKey`: `diagnosis_icd10`
   - `scaleType`: `logarithmic`
   - Suggested codes in seeded mock results: `C34.%` (lung), `C50.%` (breast), `C18.%` (colorectal), `C61` (prostate), `C25.%` (pancreas)
   - Axis labels: x=`ICD-10 code`, y=`Cases`
   - Purpose: explicitly demonstrate ICD-10-based oncology stratification and support long-tail code frequency visualization.

4. `Procedure category distribution`
   - Component: `lens-chart`
   - `chartType`: `bar`
   - `indexAxis`: `y`
   - `dataKey`: `procedure_category`
   - Categories: `surgery`, `systemic-therapy`, `radiotherapy`, `diagnostic-procedure`, `other`
   - Axis labels: x=`Procedures`, y=`Category`
   - Purpose: clearly separate procedure analytics from diagnosis analytics.

Result payloads should include all four stratifier keys (`gender`, `age_bucket`, `diagnosis_icd10`, `procedure_category`) for each fictional site.

### 8. Implementation scope control
Keep it intentionally partial, not full KDS:

1. Fully represent module structure and semantics
2. Curate compact value lists (especially ICD oncology subset)
3. Avoid exhaustive value sets/entire code systems

---

If this plan matches your intent, I’ll implement it directly in:

1. `lens/demo-catalogue.json`
2. `lens/demo.svelte`

and then run a quick validation pass to ensure the demo still exercises all Lens features.
