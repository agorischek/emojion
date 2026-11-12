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

Strings are encoded with animals and plants, such as `🐜`, `🐝`, `🐄`, `🌷`,
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

Whitespace and emoji variation selectors are ignored.

See [`characters.ts`](./src/characters.ts) for the full character map.

## Use

```sh
npm install emj
```

`emj` works just like the built-in `JSON` object, only with more emoji.

```ts
import { parse, stringify } from 'emj';

parse('🙌😶😠🤑😳👡🐘🐁🦉🦒🐖🦉🦏✋');
// { name: 'Emojion' }

stringify({ created: 2019 });
// '🙌😖😭😳😠😛😳🤤🕑🕛🕐🕘✋'
```

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

## The Fine Print

For a joke, Emojion takes its job surprisingly seriously. `parse()` and
`stringify()` follow the same rules as `JSON.parse()` and `JSON.stringify()`,
ship TypeScript types, have no runtime dependencies, and work in Node 10 and
later. It's also fast.

<details>
<summary><code>parse(emojion)</code></summary>

Returns the value an Emojion document holds: an object, array, string, number,
boolean or `null`, built the way `JSON.parse()` would build it.

- A `__proto__` key, or any other key `Object.prototype` has, becomes an
  ordinary own property. It never touches the prototype.
- When a key repeats, the last value wins.
- Numbers convert the way `JSON.parse()` converts them, so `⏰🕛` is `-0`.
- There is no `reviver` argument.

</details>

<details>
<summary><code>stringify(value)</code></summary>

Writes a value as an Emojion document, following the rules of
`JSON.stringify()`:

- It calls `toJSON()`, so a `Date` becomes its ISO string.
- It unwraps `new Number()`, `new String()` and `new Boolean()`.
- It writes `NaN`, `Infinity` and `-Infinity` as `null`, and `-0` as `0`.
- In objects, it skips `undefined`, functions and symbols. In arrays, it writes
  them, and holes, as `null`.
- It writes only own enumerable string keys, so a `Map`, `Set` or class instance
  becomes an object of its own properties.
- There is no `replacer` or `space` argument.

</details>

<details>
<summary>Errors and limits</summary>

- `parse()` throws a `SyntaxError` for anything that isn't valid Emojion, naming
  the unexpected emoji and its position.
- `stringify()` throws a `TypeError` for a `BigInt`, a circular structure, or a
  value Emojion can't hold at all: `undefined`, a function or a symbol on its
  own. (`JSON.stringify()` returns `undefined` there, but every Emojion document
  holds a value.)
- Arrays and objects nest up to 512 levels deep, not counting the top-level
  object. Past that, `parse()` throws a `SyntaxError` and `stringify()` a
  `RangeError`.

</details>

<details>
<summary>TypeScript</summary>

`parse()` returns the exported `Json` type, and `stringify()` accepts `unknown`.

```ts
import type { Json } from 'emj';
// string | number | boolean | null | Json[] | { [key: string]: Json }
```

</details>

<details>
<summary>Converting to and from JSON text</summary>

```ts
const toJson = (emojion: string) => JSON.stringify(parse(emojion));
const fromJson = (json: string) => stringify(JSON.parse(json));
```

</details>

<details>
<summary>Upgrading from 0.1</summary>

In 0.1, both functions worked with JSON text. In 0.2 they work with values, and
`generate()` became `stringify()`.

| 0.1                               | 0.2                              |
| --------------------------------- | -------------------------------- |
| `JSON.parse(parse(emojion))`      | `parse(emojion)`                 |
| `parse(emojion)`                  | `JSON.stringify(parse(emojion))` |
| `generate(json)`                  | `stringify(JSON.parse(json))`    |
| `generate(JSON.stringify(value))` | `stringify(value)`               |

Don't pass JSON text straight to `stringify()`: it will faithfully write it as
one long string.

</details>

<details>
<summary>Speed</summary>

`parse()` reads each document in a single pass with a hand-written parser that
builds values as it goes, and `stringify()` walks the value directly. Run
`npm run bench` to compare them with `JSON.parse()` and `JSON.stringify()`, or
`npm run bench:ab -- <ref> <ref>` to compare two versions. Measurements are in
[`bench/RESULTS.md`](./bench/RESULTS.md).

</details>
