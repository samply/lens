# Creating a new application

Lens is framework agnostic, so there are many ways to build and deploy your application. This guide focuses on compatibility with other projects in the [Samply organization](https://github.com/samply), so we use SvelteKit as the frontend framework and Docker for deployment.

To create a new Sveltkit application run `npx sv create my-app`. We recommend that you use the minimal template with TypeScript syntax and enable Prettier and ESLint.

Now `cd` to the new directory and install Lens:

```bash
npm install @samply/lens
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

To automatically build Docker images and publish them to Docker Hub when a branch changes, we recommend to use the [Samply Docker CI](https://github.com/samply/github-workflows/blob/main/.github/workflows/docker-ci.yml) workflow for GitHub Actions. Use the [workflow template](https://github.com/samply/.github/blob/main/workflow-templates/docker-ci-template.yml) or manually create `.github/workflows/docker.yml` with the following content:

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
