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

let zitiBrowserClient;
let zitiServiceName = 'browzermost.tools.netfoundry.io';

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

      let access_token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im5ETmFMd1c1dVR4b0haNXZMaVR1aSJ9.eyJlbWFpbCI6ImN1cnQudHVkb3JAbmV0Zm91bmRyeS5pbyIsImlzcyI6Imh0dHBzOi8vZGV2LWphMjhvanprLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDExMjU0MjM0ODc2MjU1NDAwNzE3NyIsImF1ZCI6WyJodHRwczovL2FwcC5tYXR0ZXJtb3N0LmJyb3d6ZXIuY2xvdWR6aXRpLmlvIiwiaHR0cHM6Ly9kZXYtamEyOG9qemsudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc0ODQ0Mzg0MiwiZXhwIjoxNzQ4NTMwMjQyLCJzY29wZSI6Im9wZW5pZCBlbWFpbCIsImF6cCI6IkE3V0FzSHk3WnQxTXZLeEFLYXV0MXVnSFRxcXdTZ1h5In0.FK9n_BfzWaNUiPSFmaILFwY0Y0tm45rp34hU4uDvtduoWIYJoq-DRCMfV4HuMI4VY1t1lL_79R5G849G5uEjlu6pfgySBmztL-NgLoyN5XSM-DETL1rL5Mkd1Y6AxDLtfYv8I_XCTFJ4698MD8tdo5aSfgZcbUg5hNY9WggjFxIOB_YQTbIno-uSKLu_e5l8Q-KdYqAvqSgR3nXUgh_PqngMnxs0KDsmfi0kKBcvQPxksU4th3DH7MiB5vMAGAv3rhEArga1tAyCy55fvvFSU_VOq4oCCQ6I3fch8Lfdt8wREcJtvZ7_62G36HLAyG3Oki5srUsEldykBBdY0YZz_Q';
      
      /**
       * 
       */
      const result = zitiBrowserClient.setAccessToken( access_token );
      
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
      const response = await zitiBrowserClient.fetch(`https://${zitiServiceName}/`, {
        method: 'GET',
        serviceName: `${zitiServiceName}`,
      });

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
      const response = await zitiBrowserClient.fetch(`https://${zitiServiceName}/api/v4/users/login`, {
        method: 'POST',
        serviceName: `${zitiServiceName}`,
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({
          login_id: 'curt.tudor@netfoundry.io',
          password: 'bogusPswd',
          token:    '',
          deviceId: ''
        }),
      });

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
  form.style.display = 'flex';  // stack buttons vertically
  form.style.flexDirection = 'column';
  form.style.gap = '8px';
  rootNode.appendChild(form);

  
  // Add buttons to the DOM
  actions.forEach((action) => addButton(form, action));

  /** --------------------------------------------------------------
   * Instantiate the Client for the Ziti SDK
   */
  zitiBrowserClient = await createZitiBrowserClient({

    logLevel:       'trace',      // select your console logLevel (default is 'warn')
    logPrefix:      'Curt_Demo',  // specify whatever prefix you want

    authorizationParams: {
      controllerHost: 'cb2c8d5d-e747-4292-ad8e-e82eb35a3087-p.production.netfoundry.io',
      controllerPort: 443,
    },

  });
  

  // Handle button clicks via table lookup
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clickedId = e.submitter?.id;
    const action = actions.find(a => a.id === clickedId);
    if (action?.handler) {
      await action.handler();
    } else {
      console.warn(`No handler found for button ID: ${clickedId}`);
    }
  });

})();
