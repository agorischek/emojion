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

Call `parse()` to turn Emojion into its original JSON text string, and call
`generate()` to turn JSON text into Emojion.

```ts
import { generate, parse } from 'emj';

const json = parse('🙌😶😠🤑😳👡🐘🐁🦉🦒🐖🦉🦏✋');
// '{"name":"Emojion"}'

const emojion = generate(JSON.stringify({ created: 2019 }));
// 🙌😖😭😳😠😛😳🤤🕑🕛🕐🕘✋
```

Both functions use JSON text so every valid JSON value can round-trip without
losing type information.

## Syntax

Every Emojion document begins with `🙌` — because as soon as you start typing
Emojion, you're a winner in this author's eyes. Emojion documents end with `✋`
— because... stop.

Objects are enclosed by `👉` and `👈`, arrays are enclosed by `🤜` and `🤛`, and
array items are separated by `🤝`.

Keys are encoded with face emoji, such as `😠`, `🥺`, `😖`, `😺`, `😸`, and `😽`
(`a`, `b`, `c`, `1`, `2`, `3` ). Capital letters are prefixed with `👠`. `🗝`
represents an empty key.

Strings are encoded with animals and plants, such as `🐜`, `🐝`, `🐄`, `🌹`,
`🌱`, and `🌵` (`a`, `b`, `c`, `1`, `2`, `3` ). Capital letters are prefixed
with `👡`. `🧵` represents an empty string.

Numbers are encoded with with clocks, such as `🕛`, `🕐`, and `🕑` (`0`, `1`,
`2`). Decimal points are encoded with `⛳️` and negative numbers are prefixed
with `⏰` (because alarms are annoying).

`💚` is `true`, `💔` is `false`, and `🕳` is `null`.

In keys, Unicode characters can be encoded using `🌎` followed by fruit, such as
`🌎🍏🍊🍈🍓` for `U+0398` (which is `Θ`). In values, Unicode characters are
encoded using `🗺` followed by office supplies, such as `🗺🖋🖊🧷🔎` for `U+0394`
(which is `Δ`).

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

Emojion is built with the excellent
[Moo lexer](https://www.npmjs.com/package/moo) and
[Nearley parser](https://nearley.js.org) engines.

## Publishing

Emojion is a maintained joke package: its premise is intentionally absurd, but
its runtime dependencies and published security posture are maintained like any
other library. Garden keeps development tooling and compatible lockfile
resolutions current while runtime-range changes remain deliberate.

Garden dispatches [`Prepare Release`](./.github/workflows/prepare-release.yml)
with an exact semantic version. The tag is the release source of truth; the
publisher checks out that immutable tag and stamps the package manifest only in
its packaging worktree before publishing to npm and creating the matching GitHub
Release. Routine releases are batched to at most one per week.

Publishing uses npm Trusted Publishing.

Configure the `emj` package on npm with this trusted publisher:

- Provider: GitHub Actions
- Organization or user: `agorischek`
- Repository: `emojion`
- Workflow filename: `publish.yml`
- Environment name: leave blank

You can also configure it from an authenticated npm CLI:

```sh
npx npm@latest trust github emj --repo agorischek/emojion --file publish.yml
```
