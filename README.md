# Emojion

_Emoji Object Notation_

[![CI](https://github.com/agorischek/emojion/actions/workflows/ci.yml/badge.svg)](https://github.com/agorischek/emojion/actions/workflows/ci.yml)
[![Version](https://img.shields.io/npm/v/emj.svg)](https://www.npmjs.com/package/emj)
[![License](https://img.shields.io/github/license/agorischek/emojion.svg)](https://github.com/agorischek/emojion/blob/master/LICENSE)

```json
{
  "name": "Emojion",
  "keywords": ["emoji", "notation"],
  "created": 2019,
  "isAbsurd": true,
  "fileExtension": "🙌"
}
```

```emojion
🙌😶😠🤑😳👡🐘🐁🦉🦒🐖🦉🦏😚😳🤩😉😮😭🤤
😢🤜🐘🐁🦉🦒🐖🤝🦏🦉🐢🐜🐢🐖🦉🦏🤛😖😭😳
😠😛😳🤤🕑🕛🕐🕘🤔😢👠😠🥺😢🙃😭🤤💚🙁🤔
🥰😳👠😳😵😛😳😶😢🤔😮😶🗺🖌📋📏🔎📓✋
```

## Use

```sh
npm install emj
```

`emj` works like the built-in `JSON` object. `parse()` turns Emojion into a
JavaScript value, and `stringify()` turns a value into Emojion.

```ts
import { parse, stringify } from 'emj';

const value = parse('🙌😶😠🤑😳👡🐘🐁🦉🦒🐖🦉🦏✋');
// { name: 'Emojion' }

const emojion = stringify({ created: 2019 });
// '🙌😖😭😳😠😛😳🤤🕑🕛🕐🕘✋'

parse(stringify({ when: new Date(0), list: [1, undefined] }));
// { when: '1970-01-01T00:00:00.000Z', list: [1, null] }
```

It works in Node 10 and later, from CommonJS (`require('emj')`) or ESM.

### `parse(emojion)`

Reads an Emojion document and returns the value it holds: an object, array,
string, number, boolean or `null`, built the same way `JSON.parse()` would build
it.

- Objects are plain objects and arrays are plain arrays.
- A `__proto__` key becomes an ordinary own property; it never sets the
  prototype. The same goes for any other key that `Object.prototype` has, such
  as `toString`.
- When a key repeats, the last value wins.
- Numbers are converted the way `JSON.parse()` converts them, so `⏰🕛` is `-0`
  and digits beyond double precision are rounded.

### `stringify(value)`

Writes a value as an Emojion document, following the rules of
`JSON.stringify()`:

- It calls a value's `toJSON()` method, so a `Date` becomes its ISO string.
- It unwraps `new Number()`, `new String()` and `new Boolean()`.
- It writes `NaN`, `Infinity` and `-Infinity` as `null`, and `-0` as `0`.
- In objects, it skips properties whose value is `undefined`, a function or a
  symbol. In arrays, it writes them, and holes, as `null`.
- It writes only own enumerable string keys, so symbol keys are skipped, and a
  `Map`, `Set` or class instance becomes an object of its own properties.

`stringify()` has no `replacer` or `space` argument, and `parse()` has no
`reviver`.

### Errors and limits

- `parse()` throws a `SyntaxError` for input that is not valid Emojion. The
  message names the unexpected emoji and its position.
- `stringify()` throws a `TypeError` for a `BigInt` (unless `BigInt.prototype`
  has a `toJSON()`) and for a circular structure.
- `stringify()` also throws a `TypeError` for a value Emojion cannot hold at
  all: `undefined`, a function or a symbol on its own, or a `toJSON()` that
  returns one. `JSON.stringify()` returns `undefined` in those cases, but every
  Emojion document holds a value.
- Arrays and objects can be nested up to 512 levels deep. A top-level object
  doesn't count, because it has no `👉👈`. Past that, `parse()` throws a
  `SyntaxError` and `stringify()` throws a `RangeError`.

### TypeScript

The package ships type definitions. `parse()` returns the exported `Json` type:

```ts
import type { Json } from 'emj';
// string | number | boolean | null | Json[] | { [key: string]: Json }
```

`stringify()` accepts `unknown`, as `JSON.stringify()` accepts any value.

### JSON text

To convert between Emojion and JSON text, combine the two with `JSON`:

```ts
const toJson = (emojion: string) => JSON.stringify(parse(emojion));
const fromJson = (json: string) => stringify(JSON.parse(json));
```

### Migrating from 0.1

In 0.1, both functions worked with JSON text. In 0.2 they work with values.

| 0.1                               | 0.2                              |
| --------------------------------- | -------------------------------- |
| `JSON.parse(parse(emojion))`      | `parse(emojion)`                 |
| `parse(emojion)`                  | `JSON.stringify(parse(emojion))` |
| `generate(json)`                  | `stringify(JSON.parse(json))`    |
| `generate(JSON.stringify(value))` | `stringify(value)`               |

- `generate()` is gone. Use `stringify()`, which takes a value, not JSON text.
  Passing JSON text to `stringify()` writes it as a string, so make sure every
  old `generate(json)` call becomes `stringify(JSON.parse(json))`.
- `parse()` returns a value, not a string. If you kept the 0.1 JSON text without
  parsing it, note that a repeated key was in the text twice; now only the last
  value is kept, as `JSON.parse()` would have done.
- `stringify()` applies the `JSON.stringify()` rules above itself. A `BigInt`, a
  circular structure, or a top-level `undefined`, function or symbol throws a
  `TypeError` from `stringify()` rather than from your own `JSON.stringify()`
  call (or, for a top-level `undefined`, rather than passing `undefined` on).
- The `RangeError` for deep nesting now says "Value nesting exceeds 512 levels"
  instead of "JSON nesting exceeds 512 levels".

## Syntax

Every Emojion document begins with `🙌` — because as soon as you start typing
Emojion, you're a winner in this author's eyes. Emojion documents end with `✋`
— because... stop.

Objects are enclosed by `👉` and `👈`, arrays are enclosed by `🤜` and `🤛`, and
array items are separated by `🤝`. A top-level object has no `👉` and `👈`. A
document can also hold one array, string, number, boolean, or `null`.

Keys are encoded with face emoji, such as `😠`, `🥺`, `😖`, `😺`, `😸`, and `😽`
(`a`, `b`, `c`, `1`, `2`, `3` ). Capital letters are prefixed with `👠`. `🗝`
represents an empty key.

Strings are encoded with animals and plants, such as `🐜`, `🐝`, `🐄`, `🌹`,
`🌱`, and `🌵` (`a`, `b`, `c`, `1`, `2`, `3` ). Capital letters are prefixed
with `👡`. `🧵` represents an empty string.

Numbers are encoded with clocks, such as `🕛`, `🕐`, and `🕑` (`0`, `1`, `2`).
Decimal points are encoded with `⛳️` and negative numbers are prefixed with `⏰`
(because alarms are annoying). Exponents are prefixed with `🚀` (because they
make numbers take off), so `1e-7` is `🕐🚀⏰🕖`.

`💚` is `true`, `💔` is `false`, and `🕳` is `null`.

In keys, Unicode characters can be encoded using `🌎` followed by fruit, such as
`🌎🍏🍊🍈🍓` for `U+0398` (which is `Θ`). In values, Unicode characters are
encoded using `🗺` followed by office supplies, such as `🗺🖋🖊🧷🔎` for `U+0394`
(which is `Δ`). An encoded character can use up to six of these digits.

Whitespace and emoji variation selectors are ignored. Arrays and objects can be
nested up to 512 levels deep.

See [`characters.ts`](./src/characters.ts) for the full character map.

## Design Goals

- Unique syntax — Emojion should be its own format, not a trivial character
  substitution of a different object notation language like JSON.
- Borderline legibility — It should be possible, though likely slow, for a human
  to read an Emojion document, after some amount of memorization.
- Sense of humor — Object notation is boring. Emojion should be less so.

## Questions

### Wait... but why?

No good reason.

### No, but actually?

Well... Emojion is an exploration of emoji as first-class units of information
storage. Although emoji have become utterly prevalent in modern communication,
they typically either play an auxiliary role or convey only trivial information.
Emojion uses solely emoji to encode complete thoughts (or, at least, valid data
documents), thus exploring their ability to stand on their own.

### When should I use this?

When your coworker tells you YAML is "too hard to read".

## Tech

Emojion has no runtime dependencies. `parse()` reads each document in a single
pass with a hand-written parser that builds values as it goes, and `stringify()`
walks the value directly; neither goes through JSON text. Run `npm run bench` to
measure their speed next to `JSON.parse()` and `JSON.stringify()`, or
`npm run bench:ab -- <ref> <ref>` to compare two versions. See
[`bench/RESULTS.md`](./bench/RESULTS.md) for measurements.
