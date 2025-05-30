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

const express = require('express');

const app = express();
const port = 3000;

// Middleware to set correct MIME type for .wasm
app.use((req, res, next) => {
  if (req.path.endsWith('.wasm')) {
    res.type('application/wasm');
  }
  next();
});

app.use(express.static('dist'));
app.use(express.static('public'));

app.listen(port, () => console.log(`Listening on port ${port}!`));
