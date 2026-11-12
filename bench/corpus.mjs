// The benchmark corpus: the three test fixtures plus seeded, generated
// documents that cover shapes the fixtures lack (non-ASCII text, decimals and
// exponents, wide objects, long arrays, deep nesting, repeated keys, and
// whitespace and U+FE0F in Emojion input). Everything here is deterministic.
import { readFileSync } from 'node:fs';

const fixture = (file) =>
  JSON.parse(
    readFileSync(new URL(`../test/docs/${file}`, import.meta.url), 'utf8')
  );

// The same Park–Miller generator the random round-trip test uses.
const prng = (seed) => () => {
  seed = (seed * 48271) % 2147483647;
  return seed / 2147483647;
};

const int = (random, n) => Math.floor(random() * n);
const pick = (random, list) => list[int(random, list.length)];

const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(
    ' '
  );

// Runs of code points from a few scripts, so strings mix 2-, 3-, 4- and
// 5-nibble escapes the way real multilingual text does.
const SCRIPTS = [
  [0x4e00, 0x9fff], // CJK ideographs
  [0x3040, 0x30ff], // kana
  [0x00c0, 0x017f], // accented Latin
  [0x0400, 0x04ff], // Cyrillic
  [0x1f300, 0x1f64f], // emoji (astral, surrogate pairs)
  [0x1f680, 0x1f6ff], // more emoji
];

function unicodeText(random, length) {
  let out = '';
  while (out.length < length) {
    if (random() < 0.3) {
      out += pick(random, WORDS) + ' ';
      continue;
    }
    const [lo, hi] = pick(random, SCRIPTS);
    for (let run = 1 + int(random, 4); run > 0; run--) {
      out += String.fromCodePoint(lo + int(random, hi - lo + 1));
    }
  }
  return out;
}

function asciiText(random, words) {
  return Array.from({ length: words }, () => pick(random, WORDS)).join(' ');
}

function number(random) {
  const r = random();
  const sign = random() < 0.3 ? -1 : 1;
  if (r < 0.25) return sign * int(random, 100);
  if (r < 0.45) return sign * int(random, 2 ** 40);
  if (r < 0.75) return sign * (Math.round(random() * 1e6) / 1e4);
  if (r < 0.9) return sign * random() * 10 ** int(random, 6);
  return (
    sign *
    random() *
    10 ** (int(random, 2) ? 21 + int(random, 280) : -7 - int(random, 300))
  );
}

function unicodeDoc() {
  const random = prng(11);
  return {
    名前: 'Emojion 🙌',
    records: Array.from({ length: 40 }, (_, i) => ({
      id: i,
      title: unicodeText(random, 12),
      body: unicodeText(random, 80),
      タグ: Array.from({ length: 3 }, () => unicodeText(random, 6)),
      emoji: String.fromCodePoint(0x1f600 + int(random, 80)),
    })),
  };
}

function numbersDoc() {
  const random = prng(22);
  return {
    points: Array.from({ length: 160 }, () => [
      Math.round((random() * 180 - 90) * 1e6) / 1e6,
      Math.round((random() * 360 - 180) * 1e6) / 1e6,
      number(random),
      number(random),
    ]),
  };
}

function wideDoc() {
  const random = prng(33);
  const out = {};
  for (let i = 0; i < 600; i++) {
    const key =
      pick(random, WORDS) +
      pick(random, ['Id', 'Name', 'Count', 'Url', '_', '']) +
      i;
    const r = random();
    out[key] =
      r < 0.4
        ? int(random, 1e5)
        : r < 0.6
          ? random() < 0.5
          : r < 0.7
            ? null
            : pick(random, WORDS);
  }
  return out;
}

function arrayDoc() {
  const random = prng(44);
  return Array.from({ length: 1500 }, () => {
    const r = random();
    return r < 0.3
      ? int(random, 1000)
      : r < 0.5
        ? random() < 0.5
        : r < 0.6
          ? null
          : pick(random, WORDS);
  });
}

function recordsDoc() {
  const random = prng(55);
  return Array.from({ length: 120 }, (_, i) => ({
    id: i,
    name: asciiText(random, 2),
    active: random() < 0.5,
    score: int(random, 1000),
    tags: [pick(random, WORDS), pick(random, WORDS)],
    parent: null,
  }));
}

// Alternating objects and arrays, 508 levels below the top-level object, so
// the whole document sits just under the 512-level limit.
function deepDoc() {
  let inner = [];
  for (let level = 253; level >= 0; level--) {
    inner = [{ depth: level, ok: true, next: inner }];
  }
  return { root: 'deep', next: inner };
}

// Emojion as a person might format it: one member per line, two-space
// indentation, and U+FE0F after the emoji that usually carry it. Built from
// `generate` on scalars so it never depends on generator internals.
const VS16 = new Set(['🕊', '🕳', '🗝', '🗺']);

export function prettyEmojion(value, generate) {
  const start = '🙌';
  const end = '✋';
  const scalar = (v) =>
    generate(JSON.stringify(v)).slice(start.length, -end.length);
  const key = (k) => scalar({ [k]: 0 }).slice(0, -'🕛'.length);
  const pad = (depth) => '\n' + '  '.repeat(depth);
  const members = (object, depth) =>
    Object.keys(object)
      .map((k) => pad(depth) + key(k) + ' ' + encode(object[k], depth))
      .join('');
  const encode = (v, depth) => {
    if (Array.isArray(v)) {
      if (!v.length) return '🤜🤛';
      return (
        '🤜' +
        v.map((item) => pad(depth + 1) + encode(item, depth + 1)).join(' 🤝') +
        pad(depth) +
        '🤛'
      );
    }
    if (v && typeof v === 'object')
      return '👉' + members(v, depth + 1) + pad(depth) + '👈';
    return scalar(v);
  };
  const body =
    value && typeof value === 'object' && !Array.isArray(value)
      ? members(value, 1) + '\n'
      : ' ' + encode(value, 0) + '\n';
  let out = '';
  for (const char of start + body + end)
    out += VS16.has(char) ? char + '️' : char;
  return out + '\n';
}

/**
 * The documents to benchmark. `json` is the input to `generate`, `emojion` is
 * the input to `parse`, and `expected` is what `parse` must return. Pass the
 * `generate` of a known-good build; it only shapes the Emojion inputs.
 */
export function corpus(generate) {
  const large = fixture('3.json');
  const values = {
    small: fixture('1.json'),
    medium: fixture('2.json'),
    large,
    xlarge: Array.from({ length: 8 }, () => large),
    unicode: unicodeDoc(),
    numbers: numbersDoc(),
    wide: wideDoc(),
    array: arrayDoc(),
    records: recordsDoc(),
    deep: deepDoc(),
  };
  const docs = Object.entries(values).map(([name, value]) => {
    const json = JSON.stringify(value);
    return { name, json, emojion: generate(json), expected: json };
  });
  // Same content as `large`, but both inputs carry whitespace: indented JSON
  // into `generate`, and formatted Emojion with U+FE0F into `parse`.
  docs.push({
    name: 'pretty',
    json: JSON.stringify(large, null, 2),
    emojion: prettyEmojion(large, generate),
    expected: JSON.stringify(large),
  });
  return docs;
}
