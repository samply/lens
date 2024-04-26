# 🔎 samply.lens 🔍

samply.lens is a front-end library, that provides common functionalities necessary for building search-, exploration and visualization  applications. The primary target of this library is to deliver a good amount of building blocks, while also being open to user specific extensions.

## Important Notice 
The library is currently undergoing a change in the technological stack. Because of this, the current api is not completly finalized and is subject to changes in the next months.

Our main reasons for doing a complete rewrite of the samply.lens are that we wanted to make the provided components more adjustable for users and allow an framework independent usage. Because of this, we switched from writting a [PrimeNG](https://www.primefaces.org/primeng) based [Angular](https://angular.io/) component library, to writting a web components library based on [Svelte](https://svelte.dev/) and plain CSS.

The old version of the library, will be no longer maintained. If you want to take a look at the source code, you can still find it [here](https://github.com/samply/lens-angular).

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

### Building the Library locally
If you want to make changes to the lens library while integrating those changes directly in the local development version of your application, you need to tell npm to make lens locally available. For this use-case, we prepared to npm scripts:

1) Run `npm run watch`, to start building the library on changes
2) Open a second terminal
3) Run `npm run link` which will make the library available locally
4) In your own applications repository run `npm link @samply/lens`

To controll that the linking of the local version worked, run `npm ls | grep lens` in your applications repository and verify that it refers to your local lens repository.

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
- On a short term, we plan on publishing the library on [npmjs](https://www.npmjs.com/). We plan to make it available as [@samply/lens](https://www.npmjs.com/package/@samply/lens)
- After making the library available on npm, we will move the `AppCCP.svelte`, `AppBBMRI.svelte` and `AppGBA.svelte` to their separate repositories that are just using this library.
- On the long term, we plan to stabilize the api and configuration options the library offers and will document them here. 

## Build With 
- [Svelte](https://svelte.dev/)

## Changes made for EHDS2/ECDC

This project is intended to give priveleged researchers the ability to search multiple national nodes for information pertaining to the prevalence of antiobiotic resistant pathogens in European hospitals. It provides searches for relevant terms in the simplified data model used in this project, which only knows about Patients and Observations. There is a [FHIR profile](https://simplifier.net/hd-eu-ecdc-amr-uc/~resources?category=Profile) for this model.

The GUI is called the "AMR Explorer". The biggest customization is the inclusion of a new category for string entry, relized in the component, see:

```
packages/lib/src/components/catalogue/StringComponent.svelte
packages/lib/src/components/catalogue/DataTreeElement.svelte
packages/lib/src/types/treeData.ts
```

Other GUI customizations include colors (CSS) and icons, see:

```
packages/demo/src/ecdc.css
packages/demo/public/ECDC_logo.svg.png
packages/demo/public/favicon-ecdc.png
```

The HTML needed to be repurposed from its original DKTK implementation:

```
packages/demo/index.html
```

The communication with Spot (Rust) was not working, it was necessary to revert to older code to get this going:

```
packages/lib/src/classes/spot.ts
```

The GUI configuration is described in:

```
packages/demo/src/AppECDC.svelte
packages/demo/public/catalogues/catalogue-ecdc.json
```

FHIR measure and CQL definitions can be found in:

```
packages/demo/src/measures.ts
```

Search for ehds2PatientMeasure and ehds2ObservationMeasure. All of the CQL has been outsourced to Focus. However, you can see CQL function and variable names defined in these templates in measures.ts and ast-to-cql-translator.ts.

The following files have been changed to add the new queries that are specific to Ecdc:

```
packages/lib/src/cql-translator-service/ast-to-cql-translator.ts
packages/lib/src/cql-translator-service/cqlquery-mappings.ts

```

In general, where there are features that are specific to this project, there will also be a comment mentioning EHDS2 and/or ECDC.

## License

Copyright 2019 - 2023 The Samply Community

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
