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

import { Cacheable, ICache, MaybePromise } from './shared';

export class InMemoryCache {
  public enclosedCache: ICache = (function() {
    let cache: Record<string, unknown> = {};

    return {
      set<T = Cacheable>(key: string, entry: T) {
        cache[key] = entry;
      },

      get<T = Cacheable>(key: string): MaybePromise<T | undefined> {
        const cacheEntry = cache[key] as T;

        if (!cacheEntry) {
          return;
        }

        return cacheEntry;
      },

      remove(key: string) {
        delete cache[key];
      },

      allKeys(): string[] {
        return Object.keys(cache);
      },
    };
  })();
}
