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

`emj` works like the built-in `JSON` object. Call `parse()` to turn Emojion into
a JavaScript value, and call `stringify()` to turn a value into Emojion.

```ts
import { parse, stringify } from 'emj';

const value = parse('🙌😶😠🤑😳👡🐘🐁🦉🦒🐖🦉🦏✋');
// { name: 'Emojion' }

const emojion = stringify({ created: 2019 });
// 🙌😖😭😳😠😛😳🤤🕑🕛🕐🕘✋
```

Emojion holds the same values as JSON, so `parse()` and `stringify()` follow the
rules of `JSON.parse()` and `JSON.stringify()`:

- `parse()` throws a `SyntaxError` if its input is not valid Emojion. A
  `__proto__` key becomes an ordinary property, and when a key repeats, the last
  value wins.
- `stringify()` calls `toJSON()` (so a `Date` becomes a string) and unwraps
  `new Number()`, `new String()` and `new Boolean()`. It writes `NaN`,
  `Infinity` and `-Infinity` as `null`. It skips `undefined`, functions and
  symbols in objects, and writes them as `null` in arrays.
- `stringify()` throws a `TypeError` for a `BigInt` or a circular structure.
  Where `JSON.stringify()` would return `undefined` (for `undefined`, a function
  or a symbol on its own), `stringify()` throws a `TypeError`, because every
  Emojion document holds a value.

To convert between Emojion and JSON text, combine them with `JSON`:

```ts
const toJson = (emojion: string) => JSON.stringify(parse(emojion));
const fromJson = (json: string) => stringify(JSON.parse(json));
```

TypeScript users can import the `Json` type, which `parse()` returns.

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

Emojion has no runtime dependencies. It reads each document in a single pass
with a hand-written parser. Run `npm run bench` to measure its speed.
