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