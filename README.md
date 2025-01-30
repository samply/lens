# 🔎 samply.lens 🔍

samply.lens is a front-end library, that provides common functionalities necessary for building search-, exploration and visualization  applications. The primary target of this library is to deliver a good amount of building blocks, while also being open to user specific extensions.

## Development Setup

If you want to setup a development environment for the samply.lens library, you will need a recent version of [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed on your system.

After that, you will need to clone this repository

``` shell
git clone https://github.com/samply/lens.git
```

and then install all dependencies with npm.

``` shell
npm install
```

With this, you can now run

``` shell
npm start
```

to start a development server, that will typically be available at [http://localhost:5173](http://localhost:5173). For further available npm scripts, you can review the [package.json](./package.json)

Lens is built using Svelte 4, which differs significantly from the newer Svelte 5. You can find the official Svelte 4 documentation at https://v4.svelte.dev/docs/introduction.

### Building the Library locally

If you want to make changes to the lens library while integrating those changes directly in the local development version of your application, you need to tell npm to make lens locally available. For this use-case, we prepared two npm scripts:

1) Run `npm run watch`, to start building the library on changes
2) Open a second terminal
3) Run `npm run link` which will make the library available locally
4) In your own applications repository run `npm link @samply/lens`

To controll that the linking of the local version worked, run `npm ls | grep lens` in your applications repository and verify that it refers to your local lens repository.

#### Additional Note for Applications using Vite

When your depending application is built with vite, you need to ensure to add the following to your vite.config.ts:

``` javascript
export default defineConfig({
    // ... 
	optimizeDeps: {
		exclude: ['@samply/lens']
	}
});
```

## Style Integration

To import the default stylings, use 
```css
@import "path_to_node_modules/@samply/lens/dist/style.css";
```
in your main css file.

Web components use "part" instead of "class". Here is how you can overwrite style properties:

```css
lens-info-button::part(info-button-icon) {
  width: 20px;
}
```

## Roadmap

- [x] On a short term, we plan on publishing the library on [npmjs](https://www.npmjs.com/). We plan to make it available as [@samply/lens](https://www.npmjs.com/package/@samply/lens)
- [ ] After making the library available on npm, we will move the `AppCCP.svelte`, `AppBBMRI.svelte` and `AppGBA.svelte` to their separate repositories that are just using this library.
- [ ] On the long term, we plan to stabilize the api and configuration options the library offers and will document them here. 

## Built With

- [Svelte](https://svelte.dev/)

## License

Copyright 2019 - 2024 The Samply Community

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
