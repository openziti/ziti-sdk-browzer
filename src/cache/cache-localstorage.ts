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

import { ICache, Cacheable, CACHE_KEY_PREFIX, MaybePromise } from './shared';

export class LocalStorageCache implements ICache {
  public set<T = Cacheable>(key: string, entry: T) {
    localStorage.setItem(key, JSON.stringify(entry));
  }

  public get<T = Cacheable>(key: string): MaybePromise<T | undefined> {
    const json = window.localStorage.getItem(key);

    if (!json) return;

    try {
      const payload = JSON.parse(json) as T;
      return payload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return;
    }
  }

  public remove(key: string) {
    localStorage.removeItem(key);
  }

  public allKeys() {
    return Object.keys(window.localStorage).filter((key) =>
      key.startsWith(CACHE_KEY_PREFIX)
    );
  }
}
