// A readable report of the current build (lib/) on the whole corpus, with the
// built-in JSON.stringify and JSON.parse on the same documents for reference.
// To compare two versions, use bench/ab.mjs instead: absolute numbers from
// separate runs of this file are not comparable to within 10% or so.
import { isDeepStrictEqual } from 'node:util';
import { bench, do_not_optimize, group, run } from 'mitata';

import { parse, stringify } from '../lib/index.js';
import { corpus } from './corpus.mjs';

// `+=` builds ropes, and V8 defers the cost of flattening one until the
// string is read. Every real consumer reads it, so the benchmark does too.
const flat = (s) => (s.charCodeAt(s.length >> 1), s);

const docs = corpus(stringify);
console.log('doc       json chars  emojion chars');
for (const doc of docs) {
  if (!isDeepStrictEqual(parse(doc.emojion), doc.expected))
    throw new Error(`parse failed: ${doc.name}`);
  if (!isDeepStrictEqual(parse(stringify(doc.value)), doc.expected))
    throw new Error(`round-trip failed: ${doc.name}`);
  console.log(
    `${doc.name.padEnd(9)} ${String(doc.json.length).padStart(10)} ${String(doc.emojion.length).padStart(14)}`
  );
}

for (const { name, value, json, emojion, parseOnly } of docs) {
  group(name, () => {
    if (!parseOnly) {
      bench('stringify', () => do_not_optimize(flat(stringify(value))));
      bench('JSON.stringify', () =>
        do_not_optimize(flat(JSON.stringify(value)))
      );
    }
    bench('parse', () => do_not_optimize(parse(emojion)));
    bench('JSON.parse', () => do_not_optimize(JSON.parse(json)));
  });
}

await run();
