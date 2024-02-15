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

## Roadmap 
- On a short term, we plan on publishing the library on [npmjs](https://www.npmjs.com/). We plan to make it available as [@samply/lens](https://www.npmjs.com/package/@samply/lens)
- After making the library available on npm, we will move the `AppCCP.svelte`, `AppBBMRI.svelte` and `AppGBA.svelte` to their separate repositories that are just using this library.
- On the long term, we plan to stabilize the api and configuration options the library offers and will document them here. 

## Build With 
- [Svelte](https://svelte.dev/)

## License

Copyright 2019 - 2023 The Samply Community

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
