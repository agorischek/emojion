import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';

const globals = {
  lodash: 'lodash',
};

export default {
  input: './src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
    globals: globals,
  },
  plugins: [
    resolve(),
    typescript(),
    commonjs({
      namedExports: {
        'node_modules/lodash/lodash.js': [
          'invert',
          'merge',
          'forEach',
          'forOwn',
        ],
        'node_modules/moo/moo.js': ['compile'],
        'node_modules/nearley/lib/nearley.js': ['Grammar', 'Parser'],
      },
    }),
  ],
};
