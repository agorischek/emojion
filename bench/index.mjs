import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { bench, do_not_optimize, group, run, summary } from 'mitata';

import { parse, stringify } from '../lib/index.js';

const read = (file) =>
  JSON.parse(
    readFileSync(new URL(`../test/docs/${file}`, import.meta.url), 'utf8')
  );

const large = read('3.json');
const docs = {
  small: read('1.json'),
  medium: read('2.json'),
  large,
  xlarge: Array.from({ length: 8 }, () => structuredClone(large)),
};

for (let [name, value] of Object.entries(docs)) {
  let emojion = stringify(value);
  let json = JSON.stringify(value);
  if (!isDeepStrictEqual(parse(emojion), value)) {
    throw new Error(`round-trip failed: ${name}`);
  }
  console.log(
    `${name}: ${json.length} chars json, ${emojion.length} chars emojion`
  );

  // JSON.stringify() and JSON.parse() are there for reference.
  group(name, () => {
    summary(() => {
      bench('stringify', () => do_not_optimize(stringify(value))).gc('inner');
      bench('JSON.stringify', () =>
        do_not_optimize(JSON.stringify(value))
      ).gc('inner');
    });
    summary(() => {
      bench('parse', () => do_not_optimize(parse(emojion))).gc('inner');
      bench('JSON.parse', () => do_not_optimize(JSON.parse(json))).gc(
        'inner'
      );
    });
  });
}

await run();
