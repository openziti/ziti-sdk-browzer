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

import {
  CACHE_KEY_PREFIX,
  ICache,
  KeyManifestEntry,
  MaybePromise,
} from './shared';

export class CacheKeyManifest {
  private readonly manifestKey: string;

  constructor(private cache: ICache, private clientId: string) {
    this.manifestKey = this.createManifestKeyFrom(this.clientId);
  }

  async add(key: string): Promise<void> {
    const keys = new Set(
      (await this.cache.get<KeyManifestEntry>(this.manifestKey))?.keys || []
    );

    keys.add(key);

    await this.cache.set<KeyManifestEntry>(this.manifestKey, {
      keys: [...keys],
    });
  }

  async remove(key: string): Promise<void> {
    const entry = await this.cache.get<KeyManifestEntry>(this.manifestKey);

    if (entry) {
      const keys = new Set(entry.keys);
      keys.delete(key);

      if (keys.size > 0) {
        return await this.cache.set(this.manifestKey, { keys: [...keys] });
      }

      return await this.cache.remove(this.manifestKey);
    }
  }

  get(): MaybePromise<KeyManifestEntry | undefined> {
    return this.cache.get<KeyManifestEntry>(this.manifestKey);
  }

  clear(): MaybePromise<void> {
    return this.cache.remove(this.manifestKey);
  }

  private createManifestKeyFrom(clientId: string): string {
    return `${CACHE_KEY_PREFIX}::${clientId}`;
  }
}
