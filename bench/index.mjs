// A readable report of the current build (lib/) on the whole corpus.
// To compare two versions, use bench/ab.mjs instead: absolute numbers from
// separate runs of this file are not comparable to within 10% or so.
import { bench, do_not_optimize, group, run } from 'mitata';

import { generate, parse } from '../lib/index.js';
import { corpus } from './corpus.mjs';

// `+=` builds ropes, and V8 defers the cost of flattening one until the
// string is read. Every real consumer reads it, so the benchmark does too.
const flat = (s) => (s.charCodeAt(s.length >> 1), s);

const docs = corpus(generate);
console.log('doc       json chars  emojion chars');
for (const doc of docs) {
  if (parse(doc.emojion) !== doc.expected)
    throw new Error(`parse failed: ${doc.name}`);
  if (parse(generate(doc.json)) !== doc.expected)
    throw new Error(`round-trip failed: ${doc.name}`);
  console.log(
    `${doc.name.padEnd(9)} ${String(doc.json.length).padStart(10)} ${String(doc.emojion.length).padStart(14)}`
  );
}

for (const { name, json, emojion } of docs) {
  group(name, () => {
    // generate() starts with JSON.parse; this row is that share of its time.
    bench('JSON.parse', () => do_not_optimize(JSON.parse(json)));
    bench('generate', () => do_not_optimize(flat(generate(json))));
    bench('parse', () => do_not_optimize(flat(parse(emojion))));
  });
}

await run();
