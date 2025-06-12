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
  // CacheKey,
  CacheManager,
  CacheEntry,
  CACHE_KEY_ID_TOKEN_SUFFIX,
  DecodedToken,
} from './cache';

import { CacheKeyManifest } from './cache/key-manifest';

import { CACHE_LOCATION_MEMORY, DEFAULT_NOW_PROVIDER } from './constants';

import {
  ZitiBrowserClientOptions,
  AuthorizationParams,
  CacheLocation,
} from './global';

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
    // set some defaults
    logLevel: 'Info',
    logPrefix: 'Ziti-SDK-Browser',

    // set some defaults
    authorizationParams: {
      controllerHost: 'ctrl.ziti.netfoundry.io',
      controllerPort: 443,
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

    this.logger.info(`ctor: start`);

    this.zitiContext = this.zitiBrowzerCore.createZitiContext({
      logger: this.logger,
      controllerApi: `https://${this.options.authorizationParams.controllerHost}:${this.options.authorizationParams.controllerPort}/edge/client/v1`,
      sdkType: pjson.name,
      sdkVersion: pjson.version,
      sdkBranch: buildInfo.sdkBranch,
      sdkRevision: buildInfo.sdkRevision,
      token_type: 'Bearer',
    });
    this.logger.info(`ctor: ZitiContext created`);

    window._zitiContext = this.zitiContext; // allow WASM to find us

    this.zitiContext.setKeyTypeEC();
    this.zitiContext.createEnroller();

    this.zitiContext.setCurrentAPISession({token: this.options.authorizationParams.apiSessionToken});
    this.logger.info(`apiSessionToken now set to [${this.options.authorizationParams.apiSessionToken}]`);

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

    this.nowProvider = this.options.nowProvider || DEFAULT_NOW_PROVIDER;

    this.cacheManager = new CacheManager(
      cache,
      !cache.allKeys
        ? new CacheKeyManifest(
            cache,
            this.options.authorizationParams.controllerHost ||
              'ziti-sdk-browser'
          )
        : undefined,
      this.nowProvider
    );

    this.logger.info(`ctor: completed`);
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
   * const result = zitiBrowserClient.setAPISessionToken();
   * ```
   *
   * Set the zt-session token to be used to make REST calls to the Ziti Controller.
   */
  public setAPISessionToken(token: string): void {
    this._setAPISessionToken(token);
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
      this.options.authorizationParams.controllerHost || 'ziti-sdk-browser',
      entry.id_token,
      entry.decodedToken
    );

    await this.cacheManager.set(entryWithoutIdToken);
  }

  private _setAccessToken(token: string): boolean {
    return this.zitiContext.setAccessToken(token);
  }

  private _setAPISessionToken(token: string): void { 
    this.zitiContext.setCurrentAPISession({token: this.options.authorizationParams.apiSessionToken});
    this.logger.info(`apiSessionToken now set to [${this.options.authorizationParams.apiSessionToken}]`);
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
      this.logger.error(`ephemeral Cert acquisition failed`);
      // If we couldn't acquire a cert, it most likely means that the JWT from the IdP needs a refresh
      throw new Error(
        `ephemeral Cert acquisition failed; IdP might not be registered with Ziti`
      );
    } else {
      this.logger.info(`ephemeral Cert acquisition succeeded`);
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
