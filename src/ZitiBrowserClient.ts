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

import { ZitiBrowzerCore } from '@openziti/ziti-browzer-core';

import {
  InMemoryCache,
  ICache,
  CacheKey,
  CacheManager,
  CacheEntry,
  IdTokenEntry,
  CACHE_KEY_ID_TOKEN_SUFFIX,
  DecodedToken,
} from './cache';

import { CacheKeyManifest } from './cache/key-manifest';

import { CACHE_LOCATION_MEMORY, DEFAULT_NOW_PROVIDER } from './constants';

import {
  ZitiBrowserClientOptions,
  AuthorizationParams,
  CacheLocation,
  User,
  IdToken,
  GetTokenSilentlyVerboseResponse,
} from './global';

import { getUniqueScopes } from './scope';

import { cacheFactory } from './ZitiBrowserClient.utils';

import pjson from '../package.json';
import { buildInfo } from './buildInfo';

declare global {
  interface Window {
    _zitiContext?: object;
  }
}

/**
 * ZitiBrowserClient:
 *
 * This is the main class that Web Applications should interface with
 */
export class ZitiBrowserClient {
  private readonly cacheManager: CacheManager;
  private readonly nowProvider: () => number | Promise<number>;
  private readonly scope: string;
  private readonly zitiBrowzerCore: ZitiBrowzerCore;
  // eslint-disable-next-line
  private readonly zitiContext: any;
  // eslint-disable-next-line
  private readonly logger: any;

  private readonly userCache: ICache = new InMemoryCache().enclosedCache;

  private readonly options: ZitiBrowserClientOptions & {
    authorizationParams: AuthorizationParams;
  };

  private readonly defaultOptions: Partial<ZitiBrowserClientOptions> = {
    useRefreshTokensFallback: false,

    logLevel: 'Warn',

    //
    authorizationParams: {
      controllerHost: 'ctrl.ziti.netfoundry.io',
      controllerPort: 1280,
      scope: 'email',
    },
  };

  /**
   * ZitiBrowserClient ctor
   *
   * @param options
   */
  constructor(options: ZitiBrowserClientOptions) {
    this.options = {
      ...this.defaultOptions,
      ...options,
      authorizationParams: {
        ...this.defaultOptions.authorizationParams,
        ...options.authorizationParams,
      },
    };

    this.zitiBrowzerCore = new ZitiBrowzerCore({});

    this.logger = this.zitiBrowzerCore.createZitiLogger({
      logLevel: this.options.logLevel,
      suffix: this.options.logPrefix,
    });

    this.zitiContext = this.zitiBrowzerCore.createZitiContext({
      logger: this.logger,
      controllerApi: `https://${this.options.authorizationParams.controllerHost}:${this.options.authorizationParams.controllerPort}/edge/client/v1`,
      sdkType: pjson.name,
      sdkVersion: pjson.version,
      sdkBranch: buildInfo.sdkBranch,
      sdkRevision: buildInfo.sdkRevision,
      token_type: 'Bearer',
    });
    this.logger.trace(`_initialize: ZitiContext created`);

    window._zitiContext = this.zitiContext; // allow WASM to find us

    this.zitiContext.setKeyTypeEC();
    this.zitiContext.createEnroller();

    let cacheLocation: CacheLocation | undefined;
    let cache: ICache;

    if (options.cache) {
      cache = options.cache;
    } else {
      cacheLocation = options.cacheLocation || CACHE_LOCATION_MEMORY;

      if (!cacheFactory(cacheLocation)) {
        throw new Error(`Invalid cache location "${cacheLocation}"`);
      }

      cache = cacheFactory(cacheLocation)();
    }

    // Construct the scopes based on the following:
    // 1. Always include `openid`
    // 2. Include the scopes provided in `authorizationParams. This defaults to `profile email`
    // 3. Add `offline_access` if `useRefreshTokens` is enabled
    this.scope = getUniqueScopes(
      'openid',
      this.options.authorizationParams.scope,
      this.options.useRefreshTokens ? 'offline_access' : ''
    );

    this.nowProvider = this.options.nowProvider || DEFAULT_NOW_PROVIDER;

    this.cacheManager = new CacheManager(
      cache,
      !cache.allKeys
        ? new CacheKeyManifest(cache, this.options.clientId)
        : undefined,
      this.nowProvider
    );

    this.logger.trace(`ZitiBrowserClient.ctor completed`);
  }

  private async _initializeZitiContext() {
    await this.zitiContext.sdk_initialize_loadWASM({
      jspi: true,
    });
  }

  /** -----------------------------------------------------------
   * PUBLIC APIs
   *  ----------------------------------------------------------*/

  /**
   * ```js
   * const result = zitiBrowserClient.setAccessToken();
   * ```
   *
   * Set the JWT to be used to auth with Ziti Controller.
   */
  public setAccessToken(token: string): boolean {
    return this._setAccessToken(token);
  }

  /**
   * ```js
   * const result = zitiBrowserClient.getFreshAPISession();
   * ```
   *
   * Authenticates with Ziti Controller.
   */
  public getFreshAPISession(): boolean {
    return this._getFreshAPISession();
  }

  /**
   * ```js
   * const result = zitiBrowserClient.fetchServices();
   * ```
   *
   * Authenticates with Ziti Controller.
   */

  public async fetchServices(): Promise<object> {
    return await this._fetchServices();
  }

  /**
   * ```js
   * const result = zitiBrowserClient.enroll();
   * ```
   *
   * Does all PKI work necessary to obtain an ephemeral Cert from Ziti Controller.
   */
  public async enroll(): Promise<object> {
    return await this._enroll();
  }

  /**
   * ```js
   * const result = zitiBrowserClient.printEphemeralCert();
   * ```
   *
   * Prints ephemeral Cert obtained from Ziti Controller to the console.
   */
  public async printEphemeralCert(): Promise<void> {
    return await this._printEphemeralCert();
  }

  /**
   * ```js
   * const result = zitiBrowserClient.fetch();
   * ```
   *
   * tbw...
   */
  public async fetch(
    resource: string | Request,
    options: RequestInit | null
  ): Promise<Response> {
    return await this._fetch(resource, options);
  }

  public async getWASMInstance(): Promise<void> {
    await this._initializeZitiContext();
    const wasm = await this._getWASMInstance();
    return wasm;
  }

  /**
   * ```js
   * const claims = await zitiBrowserClient.generateKeyPair();
   * ```
   *
   * Does stuff...
   */
  public async generateKeyPair(): Promise<string | undefined> {
    await this._initializeZitiContext();
    const keypair = await this._generateKeyPair();
    return keypair;
  }

  /**
   * ```js
   * const claims = await zitiBrowserClient.getIdTokenClaims();
   * ```
   *
   * Returns all claims from the id_token if available.
   */
  public async getIdTokenClaims(): Promise<IdToken | undefined> {
    const cache = await this._getIdTokenFromCache();

    return cache?.decodedToken?.claims;
  }

  /**
   * ```js
   * const isAuthenticated = await zitiBrowserClient.isAuthenticated();
   * ```
   *
   * Returns `true` if there's valid information stored,
   * otherwise returns `false`.
   *
   */
  public async isAuthenticated() {
    const user = await this.getUser();
    return !!user;
  }

  /**
   * ```js
   * const user = await zitiBrowserClient.getUser();
   * ```
   *
   * Returns the user information if available (decoded
   * from the `id_token`).
   *
   * @typeparam TUser The type to return, has to extend {@link User}.
   */
  public async getUser<TUser extends User>(): Promise<TUser | undefined> {
    const cache = await this._getIdTokenFromCache();

    return cache?.decodedToken?.user as TUser;
  }

  /**
   * ```js
   * await zitiBrowserClient.logout();
   * ```
   *
   * Clears the application session.
   *
   */
  public async logout(): Promise<void> {}

  private async _saveEntryInCache(
    entry: CacheEntry & { id_token: string; decodedToken: DecodedToken }
  ) {
    const { id_token, decodedToken, ...entryWithoutIdToken } = entry;

    this.userCache.set(CACHE_KEY_ID_TOKEN_SUFFIX, {
      id_token,
      decodedToken,
    });

    await this.cacheManager.setIdToken(
      this.options.clientId,
      entry.id_token,
      entry.decodedToken
    );

    await this.cacheManager.set(entryWithoutIdToken);
  }

  private async _getIdTokenFromCache() {
    const audience = this.options.authorizationParams.audience || 'default';

    const cache = await this.cacheManager.getIdToken(
      new CacheKey({
        clientId: this.options.clientId,
        audience,
        scope: this.scope,
      })
    );

    const currentCache = this.userCache.get<IdTokenEntry>(
      CACHE_KEY_ID_TOKEN_SUFFIX
    ) as IdTokenEntry;

    // If the id_token in the cache matches the value we previously cached in memory return the in-memory
    // value so that object comparison will work
    if (cache && cache.id_token === currentCache?.id_token) {
      return currentCache;
    }

    this.userCache.set(CACHE_KEY_ID_TOKEN_SUFFIX, cache);
    return cache;
  }

  private async _getEntryFromCache({
    scope,
    audience,
    clientId,
  }: {
    scope: string;
    audience: string;
    clientId: string;
  }): Promise<undefined | GetTokenSilentlyVerboseResponse> {
    const entry = await this.cacheManager.get(
      new CacheKey({
        scope,
        audience,
        clientId,
      }),
      60 // get a new token if within 60 seconds of expiring
    );

    if (entry && entry.access_token) {
      const { access_token, oauthTokenScope, expires_in } = entry as CacheEntry;
      const cache = await this._getIdTokenFromCache();
      return (
        cache && {
          id_token: cache.id_token,
          access_token,
          ...(oauthTokenScope ? { scope: oauthTokenScope } : null),
          expires_in,
        }
      );
    }
  }

  private _setAccessToken(token: string): boolean {
    return this.zitiContext.setAccessToken(token);
  }

  private _getFreshAPISession(): boolean {
    return this.zitiContext.getFreshAPISession();
  }

  private async _fetchServices(): Promise<object> {
    return await this.zitiContext.fetchServices();
  }

  private async _enroll(): Promise<object> {
    let result = await this.zitiContext.enroll(); // this acquires an ephemeral Cert
    if (!result) {
      this.logger.trace(`ephemeral Cert acquisition failed`);
      // If we couldn't acquire a cert, it most likely means that the JWT from the IdP needs a refresh
      return {};
    } else {
      this.logger.trace(`ephemeral Cert acquisition succeeded`);
      return result;
    }
  }

  private async _printEphemeralCert(): Promise<void> {
    await this.zitiContext.printEphemeralCert(); // prints cert to console that was obtained by _enroll()
  }

  private async _fetch(
    resource: string | Request,
    options: RequestInit | null
  ): Promise<Response> {
    return await this.zitiContext.httpFetch(resource, options);
  }

  private async _getWASMInstance() {
    return await this.zitiContext.getWASMInstance();
  }

  private async _generateKeyPair() {
    return await this.zitiContext.generateKeyPair();
  }
}
