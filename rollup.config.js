import babel from 'rollup-plugin-babel';
// import ts from 'rollup-plugin-typescript2';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

import pkg from './package.json';

const PLUGINS = [
  resolve({
    moduleDirectories: ['node_modules'],
    extensions: ['.js', '.ts', '.json'],
    preferBuiltins: false,
    browser: true,
    onResolved: (id) => {
      console.log('Resolved:', id);
      return null; // keep default behavior
    },
  }),
  typescript({
    tsconfig: './tsconfig.json',
    exclude: ['**/*.test.ts'],
  }),
  // ts({
  //   tsconfigOverride: {exclude: ['**/*.test.ts']},
  // }),
  babel({
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    compact: true,
  }),
  json(),
  replace({
    _VERSION: JSON.stringify(pkg.version),
    preventAssignment: true,
  }),
];

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.js', format: 'cjs' },
      { file: 'dist/index.mjs', format: 'es' },
    ],
    plugins: PLUGINS,
  },
];
