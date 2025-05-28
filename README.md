<p align="center" width="100%">
<a href="https://ziti.dev"><img src="ziti.png" width="100"></a>
</p>

<p align="center">
    <b>
    <a>@openziti/ziti-sdk-browser</a>
    <br>
    <br>
    <b>A JavaScript runtime you can embed into your web app to create a <a href="https://openziti.io/blog/zitification">Zitified</a> web app.</b>
    This SDK is intended to run in web browsers (not NodeJS). This SDK allows you to run a web server resources in a private, invisible-to-the-internet VPC, 
    and _still_ make REST calls to those protected resources, from your web app, but only for authorized users of your web app.
    <br>
    <br>
    <b>Part of the <a href="https://openziti.io/about">OpenZiti</a> Zero Trust stack</b>
</p>

<p align="center">
    <br>
    <b>Are you interested in knowing how to easily embed programmable, high performance, zero trust networking into your app, on any internet connection, without VPNs?
    <br>
    Learn more about our <a href="https://openziti.io/">OpenZiti</a> project by clicking <a href="https://openziti.io/">here</a>:</b>
    <br>
</p>

---
[![Build](https://github.com/openziti/ziti-sdk-browser/workflows/Build/badge.svg?branch=main)]()
[![Issues](https://img.shields.io/github/issues-raw/openziti/ziti-sdk-browser)]()
[![npm version](https://badge.fury.io/js/@openziti%2Fziti-sdk-browser.svg)](https://badge.fury.io/js/@openziti%2Fziti-sdk-browser.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![](https://data.jsdelivr.com/v1/package/npm/@openziti/ziti-sdk-browser/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@openziti/ziti-sdk-browser)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=rounded)](CONTRIBUTING.md)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

---


<br>


# ziti-sdk-browser as a CommonJS module or ES module

This package allows [ziti-sdk-browzer](https://openziti.io/docs/reference/developer/sdk/) to be
imported as a CommonJS module or ES module.

## Installation

Use `npm` to install the ziti-sdk-browzer module:

```sh
npm install @openziti/ziti-sdk-browzer
```

Or, use `yarn` to install the ziti-sdk-browzer module:

```sh
yarn add @openziti/ziti-sdk-browzer
```

## Usage

### `createZitiBrowserClient`

This function returns a `Promise` that resolves with a newly created `ZitiBrowserClient`
object once ziti-sdk-browzer has loaded. 
If you call `createZitiBrowserClient` in a server environment (e.g. NodeJS) it will resolve to `null`.

```js
import { createZitiBrowserClient } from '@openziti/ziti-sdk-browser';

zitiBrowserClient = await createZitiBrowserClient({
    logLevel:       'trace',  // select your console logLevel (default is 'warn')
    logPrefix:      'MyApp',  // specify whatever prefix you want
    authorizationParams: {
        controllerHost: 'YOUR_ZITI_CONTROLLER_HOSTNAME',
        controllerPort: 443,    // (default is 443)
    },
});

```

## TypeScript support

This package includes TypeScript declarations. We support projects
using TypeScript versions >= 4.8.0

## Documentation

- [ziti-sdk-browzer Docs](https://openziti.io/docs)
