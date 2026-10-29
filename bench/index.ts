import { readFileSync } from 'node:fs';
import { bench, do_not_optimize, group, run, summary } from 'mitata';

import { generate, parse } from '../src/index';

const read = (file: string) =>
  JSON.stringify(
    JSON.parse(
      readFileSync(new URL(`../test/docs/${file}`, import.meta.url), 'utf8')
    )
  );

const large = read('3.json');
const docs = {
  small: read('1.json'),
  medium: read('2.json'),
  large,
  xlarge: JSON.stringify(Array.from({ length: 8 }, () => JSON.parse(large))),
};

for (let [name, json] of Object.entries(docs)) {
  let emojion = generate(json);
  if (parse(emojion) !== json) throw new Error(`round-trip failed: ${name}`);
  console.log(
    `${name}: ${json.length} chars json, ${emojion.length} chars emojion`
  );

  group(name, () => {
    summary(() => {
      bench('generate', () => do_not_optimize(generate(json))).gc('inner');
      bench('parse', () => do_not_optimize(parse(emojion))).gc('inner');
    });
  });
}

await run();
