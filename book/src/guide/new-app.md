# Creating a new application

Lens is framework agnostic, so there are many ways to build and deploy your application. This guide focuses on compatibility with other projects in the [Samply organization](https://github.com/samply), so we use SvelteKit as the frontend framework and Docker for deployment.

To create a new SveltKit application run `npx sv create my-app`. Use the minimal template with TypeScript syntax and select Prettier and ESLint when prompted.

Now `cd` to the new directory and install Lens:

```bash
npm install @samply/lens
```

## Prettier config

The Prettier config created by `sv create` uses tabs and sets the print width to 100 [against the recommendation of Prettier](https://prettier.io/docs/options#print-width). We recommend to remove these options from `.prettierrc` and use the Prettier defaults with the Svelte plugin only:

```json
{
    "plugins": ["prettier-plugin-svelte"],
    "overrides": [
        {
            "files": "*.svelte",
            "options": {
                "parser": "svelte"
            }
        }
    ]
}
```

## Configuring the root route

Typically your application will only use the root route at `src/routes`. We will import the Lens CSS and JS bundles and render the main application component. Because Lens uses Web Components we need to disable HMR and SSR. Change the content of `src/routes/+page.svelte` to:

```html
<script>
    // Using hot module replacement (HMR) with custom elements (aka web
    // components) does not work because a custom element cannot be updated once
    // registered, see https://github.com/WICG/webcomponents/issues/820.
    // Therefore we do a full page reload instead of HMR.
    if (import.meta.hot) {
        import.meta.hot.on('vite:beforeUpdate', () => {
            window.location.reload();
        });
    }

    // Import Lens CSS and JS bundles
    import "@samply/lens/style.css";
    import "@samply/lens";

    import App from '../App.svelte';
</script>

<App />
```

And add `src/routes/+page.ts`:

```ts
// Using server-side rendering (SSR) with custom elements (aka web components)
// causes issues because the server does not know that an element is a Svelte
// component and converts all props to strings.
export const ssr = false;
```

## The application component

Your main application code lives in the application component. Create the file `src/app.css` and leave it empty and create `src/App.svelte` with the following content:

```html
<script lang="ts">
    import "./app.css";
</script>

<lens-search-button></lens-search-button>
```

Now run `npm run dev` and open <http://localhost:5173/> in your browser. You should see a search button in the top left corner of the page.

## Options and catalogue

Your application must pass two objects to Lens. The [LensOptions](https://samply.github.io/lens/docs/types/LensOptions.html) object contains general configuration options and the [Catalogue](https://samply.github.io/lens/docs/types/Catalogue.html) object describes what users can search for. You can define these objects in TypeScript but many applications in the Samply organization define them in JSON files.

Assuming you are using JSON files, create the file `src/options.json` containing the empty object `{}` and the file `src/catalogue.json` with the following content:

```json
[
    {
        "key": "rh_factor",
        "name": "Rh factor",
        "system": "",
        "fieldType": "single-select",
        "type": "EQUALS",
        "criteria": [
            {
                "key": "rh_positive",
                "name": "Rh+"
            },
            {
                "key": "rh_negative",
                "name": "Rh-"
            }
        ]
    }
]
```

Add the following to the top of `src/App.svelte` to load the JSON files and pass the objects to Lens:

```html
<script lang="ts">
    import { onMount } from "svelte";
    import {
        setOptions,
        setCatalogue,
        type LensOptions,
        type Catalogue,
    } from "@samply/lens";
    import options from "./options.json";
    import catalogue from "./catalogue.json";
    onMount(() => {
        setOptions(options as LensOptions);
        setCatalogue(catalogue as Catalogue);
    });
</script>

<lens-catalogue></lens-catalogue>
```

When you run `npm run dev` you should see the catalogue component with the "Rh factor" item.

### Schema validation

Lens includes JSON schemas for the options and the catalogue type. Create the script `scripts/validate-json-schema.bash` to validate the JSON files against the JSON schemas:

```bash
set -e # Return non-zero exit status if one of the validations fails
npx ajv validate -c ajv-formats -s node_modules/@samply/lens/schema/options.schema.json -d src/options.json
npx ajv validate -c ajv-formats -s node_modules/@samply/lens/schema/catalogue.schema.json -d src/catalogue.json
```

Then install the required dependencies and test the script:

```
npm install ajv-cli ajv-formats --save-dev
bash scripts/validate-json-schema.bash
```

You can also configure VS Code to validate your JSON files against the JSON schema. This will show validation errors in your editor and provide IntelliSense. To do so add the following configuration to your workspace settings in VS Code:

```json
"json.schemas": [
    {
        "fileMatch": [
            "catalogue*.json"
        ],
        "url": "./node_modules/@samply/lens/schema/catalogue.schema.json",
    },
        {
        "fileMatch": [
            "options*.json"
        ],
        "url": "./node_modules/@samply/lens/schema/options.schema.json",
    },
]
```

### Test environment

It is a common requirement to load different options in test than in production. You can achieve this by using [a feature of SvelteKit](https://svelte.dev/tutorial/kit/env-dynamic-public) that makes environment variables from the server available in the browser. Applications in the Samply organization commonly accept the following environment variables:

- `PUBLIC_ENVIRONMENT`: Accepts the name of the environment, e.g. `production` or `test`
- `PUBLIC_BACKEND_URL`: Overwrites the URL of the backend that your application queries

For example you could handle the `PUBLIC_ENVIRONMENT` variable as follows:

```html
<script lang="ts">
       import { env } from "$env/dynamic/public";
       ...
    onMount(() => {
           setOptions(env.PUBLIC_ENVIRONMENT === "test" ? testOptions : prodOptions);
    });
       ...
</script>
```

## Deployment

We recommend that projects in the Samply organization follow these deployment practices. We will use Node.js inside Docker. Run `npm install @sveltejs/adapter-node` and change the adapter in `svelte.config.js`:

```diff
-import adapter from '@sveltejs/adapter-auto';
+import adapter from '@sveltejs/adapter-node';
```

Then you can remove `@sveltejs/adapter-auto` from `package.json`. Now create a `Dockerfile` with the following content:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY vite.config.ts svelte.config.js ./
COPY src ./src
COPY static ./static

# Build the SvelteKit project
RUN npm run build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["node", "build"]
```

To automatically build Docker images and publish them to Docker Hub when a branch changes, we recommend to use the [Samply Docker CI](https://github.com/samply/github-workflows/blob/main/.github/workflows/docker-ci.yml) workflow for GitHub Actions. Use the [workflow template](https://github.com/samply/.github/blob/main/workflow-templates/docker-ci-template.yml) or copy the following into `.github/workflows/docker.yml`:

```yml
# This workflow builds a Docker image from the Dockerfile and publishes the
# image to Docker Hub. How the image tags are chosen is documented here:
# https://github.com/samply/github-workflows/blob/main/.github/workflows/docker-ci.yml
#
# This file is copied and adapted from:
# https://github.com/samply/.github/blob/main/workflow-templates/docker-ci-template.yml

name: Docker CI

on:
    push:
        branches:
            - main
            - develop
        # Build when a new version is tagged
        tags:
            - "v*.*.*"
    pull_request:
        branches:
            - main
            - develop
    schedule:
        # Build every night at 1am
        - cron: "0 1 * * *"
jobs:
    build:
        # This workflow defines how a samply docker image is built, tested and published.
        # Visit: https://github.com/samply/github-workflows/blob/main/.github/workflows/docker-ci.yml, for more information
        uses: samply/github-workflows/.github/workflows/docker-ci.yml@main
        with:
            # The Docker Hub Repository you want eventually push to, e.g samply/share-client
            image-name: "samply/your-project"
            # Where to push your images ("dockerhub", "ghcr", "both" or "none")
            push-to: dockerhub
        # This passes the secrets from calling workflow to the called workflow
        secrets:
            DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
            DOCKERHUB_TOKEN: ${{ secrets.DOCKERHUB_TOKEN }}
```

## Linting in GitHub Actions

You can use GitHub Actions to run the following checks on pull requests:

- [svelte-check](https://www.npmjs.com/package/svelte-check) to check for TypeScript compiler errors
- Prettier
- ESLint
- Test that the build works
- Validate catalogue and options

To do so create `.github/workflows/linting.yml` with the following content:

```yml
name: Linting
on:
    pull_request:
        branches:
            - main
            - develop
    push:
        branches:
            - develop

jobs:
    verify-code:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
            - run: npm ci
            - run: npx svelte-check
            - run: npx prettier --check .
            - run: npx eslint .
            - run: npx vite build
            - run: bash scripts/validate-json-schema.bash
```
