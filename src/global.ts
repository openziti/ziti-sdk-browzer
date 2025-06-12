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

import { ICache } from './cache';

export interface AuthorizationParams {
  /**
   *    The hostname of the Ziti Controller.
   */
  controllerHost?: string;

  /**
   *    The port the Ziti Controller API is listening on.
   */
  controllerPort?: number;

  /**
   *    The JWT (id_token or access-token) to be used to authenticate with the Ziti Controller.
   */
  accessToken?: string;

  /**
   *
   */
  apiSessionToken?: string;

}

interface BaseLoginOptions {
  /**
   *
   */
  authorizationParams?: AuthorizationParams;

  /**
   *
   */
  logLevel?: string;

  /**
   *
   */
  logPrefix?: string;
}

export interface ZitiBrowserClientOptions extends BaseLoginOptions {
  /**
   * The location to use when storing cache data. Valid values are `memory` or `localstorage`.
   * The default setting is `memory`.
   */
  cacheLocation?: CacheLocation;

  /**
   * Specify a custom cache implementation to use for token storage and retrieval. This setting takes precedence over `cacheLocation` if they are both specified.
   */
  cache?: ICache;

  /**
   * A maximum number of seconds to wait before declaring background calls to /authorize as failed for timeout
   * Defaults to 60s.
   */
  authorizeTimeoutInSeconds?: number;

  /**
   * Specify the timeout for HTTP calls using `fetch`. The default is 10 seconds.
   */
  httpTimeoutInSeconds?: number;

  /**
   * Modify the value used as the current time during the token validation.
   *
   * **Note**: Using this improperly can potentially compromise the token validation.
   */
  nowProvider?: () => Promise<number> | number;
}

/**
 * The possible locations where tokens can be stored
 */
export type CacheLocation = 'memory' | 'localstorage';

export interface IdToken {
  __raw: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: string;
  updated_at?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  azp?: string;
  nonce?: string;
  auth_time?: string;
  at_hash?: string;
  c_hash?: string;
  acr?: string;
  amr?: string[];
  sub_jwk?: string;
  cnf?: string;
  sid?: string;
  org_id?: string;
  org_name?: string;
  [key: string]: any;
}

export class User {
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: string;
  updated_at?: string;
  sub?: string;
  [key: string]: any;
}

/**
 * @ignore
 */
export type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  credentials?: 'include' | 'omit';
  body?: string;
  signal?: AbortSignal;
};
