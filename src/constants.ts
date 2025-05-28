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
 * @ignore
 */
export const DEFAULT_AUTHORIZE_TIMEOUT_IN_SECONDS = 60;

/**
 * @ignore
 */
export const DEFAULT_SILENT_TOKEN_RETRY_COUNT = 3;

/**
 * @ignore
 */
export const CLEANUP_IFRAME_TIMEOUT_IN_SECONDS = 2;

/**
 * @ignore
 */
export const DEFAULT_FETCH_TIMEOUT_MS = 10000;

export const CACHE_LOCATION_MEMORY = 'memory';
export const CACHE_LOCATION_LOCAL_STORAGE = 'localstorage';

/**
 * @ignore
 */
export const MISSING_REFRESH_TOKEN_ERROR_MESSAGE = 'Missing Refresh Token';

/**
 * @ignore
 */
export const INVALID_REFRESH_TOKEN_ERROR_MESSAGE = 'invalid refresh token';

/**
 * @ignore
 */
export const DEFAULT_SCOPE = 'openid profile email';

/**
 * @ignore
 */
export const DEFAULT_SESSION_CHECK_EXPIRY_DAYS = 1;

export const DEFAULT_NOW_PROVIDER = () => Date.now();
