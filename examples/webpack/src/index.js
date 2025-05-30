/*
Copyright NetFoundry Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Import the Ziti SDK for the Browser
 */
import { createZitiBrowserClient } from '@openziti/ziti-sdk-browser';

import './styles.css';

let zitiBrowserClient;
let zitiServiceName = 'YOUR_SERVICE_NAME';
let accessToken     = 'YOUR_ACCESS_TOKEN';
let controllerHost  = 'YOUR_ZITI_CONTROLLER_HOSTNAME';

/**
 * Table of buttons and their click handlers that demonstrate
 * using the SDK to perform certain operations
 */
const actions = [
  {
    id: 'load-wasm',
    label: 'Load WASM',
    handler: async () => {
      /**
       *
       */
      const wasm = await zitiBrowserClient.getWASMInstance();

      console.log('[WASMInstance]', wasm);
    },
  },

  {
    id: 'set-token',
    label: 'Set Access Token',
    handler: async () => {

      /**
       *
       */
      const result = zitiBrowserClient.setAccessToken(accessToken);

      console.log('[setAccessToken result]', result);
    },
  },

  {
    id: 'controller-auth',
    label: 'Controller Auth (getFreshAPISession)',
    handler: async () => {
      /**
       *
       */
      const result = await zitiBrowserClient.getFreshAPISession();

      console.log('[getFreshAPISession result]', result);
    },
  },

  {
    id: 'fetch-services',
    label: 'Fetch Services',
    handler: async () => {
      /**
       *
       */
      const result = await zitiBrowserClient.fetchServices();

      console.log('[fetchServices result]', result);
    },
  },

  {
    id: 'enroll',
    label: 'Enroll (create ephemeral x509 Cert)',
    handler: async () => {
      /**
       *
       */
      const result = await zitiBrowserClient.enroll();

      console.log('[enroll result]', result);
    },
  },

  {
    id: 'print-ephemeralcert',
    label: 'Print Cert (print ephemeral x509 Cert)',
    handler: async () => {
      /**
       *
       */
      await zitiBrowserClient.printEphemeralCert();
    },
  },

  {
    id: 'http-fetch-get',
    label: 'Do HTTP Fetch (GET)',
    handler: async () => {
      /**
       *
       */
      const response = await zitiBrowserClient.fetch(
        `https://${zitiServiceName}/`,
        {
          method: 'GET',
          serviceName: `${zitiServiceName}`,
        }
      );

      const data = await response.text();

      console.log('[HTTP Fetch result]', data);
    },
  },

  {
    id: 'http-fetch-post',
    label: 'Do HTTP Fetch (POST)',
    handler: async () => {
      /**
       *
       */
      const response = await zitiBrowserClient.fetch(
        `https://${zitiServiceName}/api/v4/users/login`,
        {
          method: 'POST',
          serviceName: `${zitiServiceName}`,
          headers: {
            'content-type': 'application/json;charset=UTF-8',
          },
          body: JSON.stringify({
            login_id: 'curt.tudor@netfoundry.io',
            password: 'bogusPswd',
            token: '',
            deviceId: '',
          }),
        }
      );

      const data = await response.json();

      console.log('[HTTP Fetch (POST) result]', data);
    },
  },
];

/**
 * Util func to add buttons to DOM
 */
function addButton(form, { id, label }) {
  const button = document.createElement('button');
  button.innerText = label;
  button.id = id;
  form.appendChild(button);
}

/**
 * The main async IIFE that runs the demo
 */
(async () => {
  const rootNode = document.getElementById('root');
  const form = document.createElement('form');
  form.style.display = 'flex'; // stack buttons vertically
  form.style.flexDirection = 'column';
  form.style.gap = '8px';
  rootNode.appendChild(form);

  // Add buttons to the DOM
  actions.forEach((action) => addButton(form, action));

  /** --------------------------------------------------------------
   * Instantiate the Client for the Ziti SDK
   */
  zitiBrowserClient = await createZitiBrowserClient({
    logLevel: 'trace', // select your console logLevel (default is 'warn')
    logPrefix: 'Curt_Demo', // specify whatever prefix you want

    authorizationParams: {
      controllerHost: controllerHost
    },
  });

  // Handle button clicks via table lookup
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clickedId = e.submitter?.id;
    const action = actions.find((a) => a.id === clickedId);
    if (action?.handler) {
      await action.handler();
    } else {
      console.warn(`No handler found for button ID: ${clickedId}`);
    }
  });
})();
