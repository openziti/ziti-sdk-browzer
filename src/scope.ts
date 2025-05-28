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
const dedupe = (arr: string[]) => Array.from(new Set(arr));

/**
 * @ignore
 */
/**
 * Returns a string of unique scopes by removing duplicates and unnecessary whitespace.
 *
 * @param {...(string | undefined)[]} scopes - A list of scope strings or undefined values.
 * @returns {string} A string containing unique scopes separated by a single space.
 */
export const getUniqueScopes = (...scopes: (string | undefined)[]) => {
  return dedupe(
    scopes
      .filter(Boolean)
      .join(' ')
      .trim()
      .split(/\s+/)
  ).join(' ');
};
