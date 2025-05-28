
import babel from "rollup-plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import wasm from '@rollup/plugin-wasm';
import url from '@rollup/plugin-url';
import copy from 'rollup-plugin-copy';



module.exports.default = [
  {
    input: 'src/index.js',
    output: {
      dir: 'dist',
      format: 'esm',
    },
    plugins: [
      // {
      //   name: 'log-imports',
      //   resolveId(source, importer) {
      //     console.log(`[import] ${source}${importer ? ` (from ${importer})` : ''}`);
      //     return null; // Let other plugins handle it
      //   }
      // }, 
      url({
        include: ['**/*.wasm'],
        limit: 0, // emit as separate file
        publicPath: '', // relative path, or customize as needed
      }),
      wasm(), // 👈 This enables Rollup to handle .wasm imports
      copy({
        targets: [
          {
            src: 'node_modules/@openziti/libcrypto-js/dist/esm/libcrypto.**.wasm',
            dest: 'dist/',
          },
        ],
      }),      
      babel(
        {
          exclude: "node_modules/**",
          runtimeHelpers: true,
          compact: true, 
        }
      ),
      commonjs({
        include: /node_modules/,
        requireReturnsDefault: 'auto'
      }),
      nodeResolve(),
    ],
  },
];
