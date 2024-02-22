import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';

export default [
  // CJS
  {
    input: 'src/lib.ts',
    output: {
      file: 'dist/lib.cjs',
      format: 'cjs',
    },
    plugins: [
      typescript(),
    ],
  },
  // Browser Bundle
  {
    input: 'src/lib.ts',
    output: {
      file: 'dist/lib.browser.js',
      format: 'umd',
      sourcemap: true,
      name: 'lruMemorise',
    },
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
        preferBuiltins: false,
      }),
      typescript(),
      terser(),
    ],
  },
  // ES
  {
    input: `./src/lib.ts`,
    output: {
      dir: 'dist',
      format: 'es',
    },
    plugins: [
      typescript({
        declaration: true,
        declarationDir: './dist/types',
      }),
    ],
  },
  {
    input: `./dist/types/lib.d.ts`,
    output: {
      file: `./dist/lib.d.ts`,
      format: 'es',
    },
    plugins: [
      dts({
        respectExternal: true,
      }),
    ],
  },
];
