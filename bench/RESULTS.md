# Performance experiments

> **API change in 0.2 (#102).** `parse()` now returns a value and `generate()`
> became `stringify()`, which takes a value. The harness measures the 0.2 API:
> `npm run bench:ab` times `parse` and `stringify`, and runs a 0.1 build the way
> a caller would get the same result, as `JSON.parse(parse(x))` and
> `generate(JSON.stringify(v))`. Everything up to
> [The native-object API](#the-native-object-api-102) was measured on 0.1, so
> `generate` there means 0.1's `generate(json)`.

The question: can `parse` and `generate` in 0.1.0 go meaningfully faster? I ran
34 A/B measurements: 21 isolated experiments and a compile-target check against
0.1.0, 9 follow-ups on top of the best parse change, and 3 combinations of
generator changes. Two ideas carry nearly all of the gain:

- **`parse`**: look tokens up in typed arrays instead of a `Map`.
- **`generate`**: encode ASCII entirely from tables, two characters at a time.

Combined, against 0.1.0, on all 11 documents (every process agreed on every
row):

|            | Node 24.13        | Node 20.20        |
| ---------- | ----------------- | ----------------- |
| `parse`    | **20–32% faster** | **14–26% faster** |
| `generate` | **16–48% faster** | **13–47% faster** |

Most ideas did not help, and several made things clearly slower. They are all
listed below.

## Method

The harness is in
[agorischek/emojion#103](https://github.com/agorischek/emojion/pull/103):

- `bench/corpus.mjs`: 11 documents. They are the three fixtures, plus seeded
  documents for Unicode text, numbers, wide objects, long arrays, repeated keys,
  nesting near the 512 limit, and formatted input.
- `bench/ab.mjs`: builds two git refs and alternates them in ~4 ms slices inside
  the same process. Each result is the median of the paired B/A time ratios,
  from 4 processes × 30 rounds. Each process alternates which build loads first.
- Results are read after each call, so V8's deferred rope flattening is counted.
  GC is never forced, so its cost is counted too. Both builds must produce
  identical output on every document before timing starts.

**Noise.** Same code on both sides (A/A), three full runs: every row's median
was within ±1.6%, and per-process medians were within ±3% (one outlier at +6%).
The experiments themselves give a larger free A/A sample. The 21 experiments
that don't touch the generator moved `generate` by at most ±1.7% (231 cells).
The generator-only experiments moved `parse` by at most ±1.3%.

**What counts as substantial:** a median time change of −10% or better on the
documents the change targets, with every process's median also faster, and no
document slower by more than 3%.

Verdicts used below:

| Verdict     | Meaning                                                      |
| ----------- | ------------------------------------------------------------ |
| **Win**     | Meets the bar above.                                         |
| **Small**   | Consistently faster, but by less than 10%.                   |
| **Neutral** | Within ±3%.                                                  |
| **Mixed**   | Faster on some documents and slower on others, beyond noise. |
| **Loss**    | Slower.                                                      |

All measurements are on an Apple M4 (macOS) with Node 24.13.0 unless noted.

## Experiments

Δ is the change in time: negative is faster. "Range" is the lowest to highest
median across the 11 documents. Full per-document numbers are in the appendix.

### Parser: isolated, against 0.1.0

| #   | Change                                                                              | `parse` Δ range                   | Verdict | Notes                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------- | --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| p01 | Token table as a null-prototype object instead of a `Map`                           | +18% … +64%                       | Loss    | Integer keys up to U+1F9F7 make a sparse dictionary-mode object, and its hash lookups are slower than `Map`'s.                                                           |
| p02 | **Token table as `Uint16Array`s**: all of the BMP, plus U+1F300–U+1FAFF offset      | **−19% … −31%**                   | **Win** | One bounds check and one load per token. Costs 132 KB of typed arrays, allocated once.                                                                                   |
| p03 | Decode surrogate pairs with `charCodeAt` instead of `codePointAt`                   | +5% … +11%                        | Loss    | `codePointAt` is a fast builtin. Doing the decode by hand only adds branches.                                                                                            |
| p05 | Scan runs of plain characters in `text()` with locals instead of `next()` per token | −0% … −8.5%                       | Small   | `next()` already gets inlined, so a hand-written loop saves little.                                                                                                      |
| p06 | Parser state as fields of a class instance instead of module-level variables        | +1% … −11%                        | Small   | A real effect: field loads are cheaper than context-slot loads. But it rewrites every function, including the emit code that #102 changes.                               |
| p07 | `text()` collects code units and calls `String.fromCharCode` once per string        | −16% … +7.5%                      | Mixed   | Helps long strings and hurts short ones (records, deep).                                                                                                                 |
| p08 | Precomputed one-character strings instead of `String.fromCharCode(code)`            | −1% … −8%                         | Small   | V8 already caches single-character strings.                                                                                                                              |
| p09 | Push JSON pieces to an array and `join()` once                                      | −0% … +20%                        | Loss    | `+=` makes a rope node in O(1). Even counting the flatten, it beats array growth plus `join()`.                                                                          |
| p10 | Strip whitespace and U+FE0F with a regex first, then skip the Space check           | +13% … +25%                       | Loss    | Slower even on the formatted document. The regex pass costs more than one compare per token.                                                                             |
| p11 | `value()` as an if-chain ordered by frequency, with range checks for kinds          | −2% … +1%                         | Neutral |                                                                                                                                                                          |
| p12 | Number digit runs scanned with locals                                               | −7.5% on `numbers`, ±1% elsewhere | Small   | Only number-heavy input benefits.                                                                                                                                        |
| p13 | Call `JSON.stringify` only when an escape decoded to a character JSON must escape   | −10% … +0%                        | Small   | Spaces and punctuation are escapes in Emojion, so 0.1.0 sends nearly every string through `JSON.stringify`. The native-object rewrite (#102) removes that call entirely. |
| p15 | `String.fromCharCode` instead of `fromCodePoint` for BMP escapes                    | 0% … +1.5%                        | Neutral |                                                                                                                                                                          |

### Parser: on top of p02

These ask whether anything still helps once token lookup is cheap. Δ is measured
against p02, not against 0.1.0.

| #            | Change                                                                           | `parse` Δ range                                              | Verdict | Notes                                                                       |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------- | --------------------------------------------------------------------------- |
| r2-p02-small | 12 KB BMP table (up to U+3000), with U+FE0F/U+FEFF checked explicitly            | −2% … +7%                                                    | Loss    | It would save 116 KB, but it costs up to 7%, so I kept the full table.      |
| r2-p03       | `charCodeAt`, indexing a table by the surrogate pair directly                    | +0.5% … +9%                                                  | Loss    |                                                                             |
| r2-p04       | Separate `Uint8Array` kind and code tables instead of packed `kind \| code << 8` | −1% … +6.5%                                                  | Loss    | Two loads cost more than a shift and a mask.                                |
| r2-p05       | p05 (inline `next()`)                                                            | −2.5% … +2.7%                                                | Neutral |                                                                             |
| r2-p06       | p06 (class state)                                                                | 0% … −9%                                                     | Small   | Still under the bar, and it would conflict with all of #102's emit changes. |
| r2-p07       | p07 (`fromCharCode` once per string)                                             | −14% … +26%                                                  | Mixed   |                                                                             |
| r2-p08       | p08 (one-character strings)                                                      | −1.5% … −4%                                                  | Small   |                                                                             |
| r2-p12       | p12 (number scan)                                                                | −5% on `numbers`                                             | Small   |                                                                             |
| r2-p13       | p13 (`JSON.stringify` only when needed)                                          | −14% (small), −7–8.5% (large, xlarge, pretty), ±2% elsewhere | Small   | Becomes moot after #102.                                                    |

### Generator: isolated, against 0.1.0

| #   | Change                                                                                              | `generate` Δ range                                                                        | Verdict            | Notes                                                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| g01 | Cache encoded keys in a `Map` for one `generate()` call                                             | −20% … +16%                                                                               | Mixed              | It wins on repeated keys (records, deep) and loses as much when keys are distinct (wide, medium). It stayed mixed when stacked on the other wins, so it's rejected. |
| g02 | **Precompute the escape for every ASCII character**, so ASCII never takes the escape path           | **−10% … −28%** on ASCII text (small, medium, large, xlarge, pretty); −0% … −5% elsewhere | **Win**            | In 0.1.0, every space and punctuation mark went through `codePointAt`, `toString(16)` and `for…of`.                                                                 |
| g03 | **Number digits via `charCodeAt` and an array**, instead of `for…of` over `String(n)` and an object | **−24%** on `numbers`, −6% on `array`                                                     | **Win** (targeted) |                                                                                                                                                                     |
| g04 | **Escape nibbles by shifting**, instead of `toString(16)` and `for…of`                              | **−43%** on `unicode`; −15% on ASCII text with escapes                                    | **Win**            |                                                                                                                                                                     |
| g06 | `for…in` instead of `Object.keys`                                                                   | −1% … +2.6%                                                                               | Neutral            |                                                                                                                                                                     |
| g07 | Push emoji to an array and `join()` once                                                            | +17% … +78%                                                                               | Loss               |                                                                                                                                                                     |
| g08 | **Encode two ASCII characters per step** from a lazily filled 128×128 table                         | **−6% … −22%** on text-heavy docs; ~0% on unicode, numbers                                | **Win**            | Fewer concatenations means fewer rope nodes.                                                                                                                        |
| g09 | Write UTF-16 code units to a buffer, then `String.fromCharCode.apply`                               | up to +168%                                                                               | Loss               |                                                                                                                                                                     |

### Generator: combined

| Combination     | Measured against | `generate` Δ range            | Notes                                                             |
| --------------- | ---------------- | ----------------------------- | ----------------------------------------------------------------- |
| g02 + g03 + g04 | 0.1.0            | −2% (wide) … −44% (unicode)   | The gains add up.                                                 |
| + g08           | g02 + g03 + g04  | −0% (numbers) … −27% (medium) | The pair table still pays off on top of the complete ASCII table. |
| + g01           | g02 + g03 + g04  | −20% … +20%                   | Still mixed, so it's rejected.                                    |

### Compile target

| #   | Change                                           | Δ range                  | Verdict | Notes                                                                                                                                                                         |
| --- | ------------------------------------------------ | ------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| t01 | Compile with `--target es2022` instead of es2015 | ±0.7% on both operations | Neutral | The output differs only in the `??` downlevel and an object spread that runs once at load. There is no speed reason to raise the target, and the shipped target stays ES2015. |

## The combined change, against 0.1.0

The wins PR contains p02, g02, g03, g04 and g08, written as one readable change.
The A/B below uses 6 processes on Node 24 and 4 on Node 20.

| doc     | `parse` before → after (Node 24) | Δ Node 24 | Δ Node 20 | `generate` before → after (Node 24) | Δ Node 24 | Δ Node 20 |
| ------- | -------------------------------- | --------: | --------: | ----------------------------------- | --------: | --------: |
| small   | 789 ns → 601 ns                  |    −24.0% |    −15.4% | 541 ns → 345 ns                     |    −36.4% |    −34.8% |
| medium  | 5.96 → 4.58 µs                   |    −23.2% |    −15.9% | 3.71 → 2.42 µs                      |    −35.0% |    −34.9% |
| large   | 115 → 91 µs                      |    −20.9% |    −15.4% | 82.0 → 42.3 µs                      |    −48.2% |    −46.3% |
| xlarge  | 916 → 730 µs                     |    −20.5% |    −14.4% | 678 → 355 µs                        |    −47.5% |    −46.8% |
| unicode | 208 → 162 µs                     |    −21.7% |    −24.3% | 173 → 97.5 µs                       |    −43.7% |    −46.2% |
| numbers | 106 → 76.8 µs                    |    −27.5% |    −21.9% | 109 → 82.8 µs                       |    −24.4% |    −20.9% |
| wide    | 170 → 115 µs                     |    −32.0% |    −26.3% | 141 → 117 µs                        |    −17.7% |    −17.3% |
| array   | 109 → 77.3 µs                    |    −29.2% |    −25.3% | 83.9 → 69.9 µs                      |    −16.7% |    −15.8% |
| records | 140 → 100 µs                     |    −28.4% |    −20.7% | 93.6 → 72.0 µs                      |    −23.0% |    −19.3% |
| deep    | 89.0 → 65.8 µs                   |    −26.3% |    −19.5% | 80.0 → 67.4 µs                      |    −15.8% |    −13.2% |
| pretty  | 135 → 106 µs                     |    −21.8% |    −16.1% | 83.8 → 44.7 µs                      |    −46.9% |    −46.3% |

**Absolute times.** These are from the interleaved harness. That harness
flattens every result and mixes all documents in one process, so they run higher
than `npm run bench` prints. Compare ratios, not absolute numbers.

**`JSON.parse` share.** The smallest `generate` gains are on wide, array and
deep, where `JSON.parse` takes 26–44% of the time and nothing here changes it.
The encoder's own speedup on those documents is larger than the table shows. For
example, on `deep`, `generate` minus `JSON.parse` goes from roughly 47 µs to 34
µs (about −28%).

**Refactor check.** The readable version was A/B'd against the experiment
branches it combines. `generate`: −3% … +1.6% against g02+g03+g04+g08. `parse`:
−0% … −3% against p02. So nothing was lost in the rewrite.

**Correctness.**

- `npm run build`, `npm test` (114 tests, including the 2,000-document random
  round-trip and a new test that text encodes the same as its characters one at
  a time), `npm run test:consumer` (Node 24, 20.18 and 20.20), and `npm audit`
  (0 vulnerabilities) all pass.
- The compiled `lib/` contains no syntax newer than ES2015.
- Node 22 isn't installed on this machine, so it is untested here.
- Node 10 isn't installed here either. CI covers it.

## Conclusions

- **Token lookup was the parser's bottleneck.** A `Map#get` per token cost about
  a fifth to a third of total parse time. Typed arrays indexed by code point
  remove most of that. Everything else tried on the scanner moved it by about
  10% at most, and usually much less: decoding, dispatch, inlining, number
  scanning, and state layout.
- **In the generator, the escape path was the bottleneck, and ASCII text hit it
  constantly.** Spaces and punctuation have no emoji of their own, so 0.1.0 sent
  them through `codePointAt`, `toString(16)` and `for…of`. Precomputing all of
  ASCII, and then pairs, is where most of the generator gain comes from.
- **`+=` beats every other string-building strategy here**, even with flattening
  charged to it: array `join()`, `String.fromCharCode` buffers, and chunked
  `fromCharCode.apply`. V8's ropes make `+=` cheap, and the flatten at the end
  is a single linear copy.
- **Caches whose benefit depends on the data are risky.** The key cache won big
  on repeated keys and lost as much on distinct ones. The pair table is
  different: it memoizes a pure function over at most 16,384 inputs, so it can't
  lose to the data.
- **The compile target doesn't matter** for this code.

## Merging alongside the native-object rewrite (#102)

_Done: #102 merged master with these changes, as described here. Measurements
are in [The native-object API](#the-native-object-api-102)._

- **Parser table (p02).** This only touches the token table, `lookup()` and
  `next()`. #102 leaves those alone, so it should merge without conflicts and
  the speedup carries over. #102's per-token work is the same; only the emitted
  values change. The percentage will be smaller there, because building objects
  adds its own cost.
- **Generator (g02, g03, g04, g08).** This replaces the tables and `encode()`,
  which #102 keeps unchanged. It also edits the three call sites in the emit
  code that #102 rewrites: the key in `encodeObject`/`encodeMembers`, the string
  case, and the number case. Those conflicts are textual and small:
  - call `encode(text, KEYS)` / `encode(text, VALUES)`;
  - index `NUMBERS` by `charCodeAt` (#102 already loops by index over
    `String(value)`).

  The speedup carries over to `stringify()`. It should be larger in relative
  terms there, because `stringify()` has no `JSON.parse` to dilute it.

- **Moot after #102:** p13 (`JSON.stringify` only when needed), because #102
  returns strings without stringifying them. p09 and g07 (array output) are
  losses anyway.
- **Suggested order:** either order works. Merging this first and rebasing #102
  means resolving three call sites in `generator.ts`.

## The native-object API (#102)

#102 replaces JSON text with values on both sides, on top of the changes above.
`parse()` builds objects and arrays as it reads, and `stringify()` walks the
value and calls `encode()` directly. Here it is against master with #104, each
side used for the same job: getting a value from Emojion, and Emojion from a
value.

- **A** = master (641e4b8, the 0.1 API with #104): `JSON.parse(parse(x))` and
  `generate(JSON.stringify(v))`.
- **B** = #102: `parse(x)` and `stringify(v)`.

The harness checks that both sides return deep-equal values from `parse` and
byte-identical Emojion from `stringify` before timing.

### Node 24.13, 6 processes

Every process agreed on the direction of every row except `parse medium`, which
is within noise. Per-process ranges are in the appendix.

| doc     | `parse` A → B    |      Δ | `stringify` A → B |      Δ |
| ------- | ---------------- | -----: | ----------------- | -----: |
| small   | 746 → 489 ns     | −34.5% | 444 → 249 ns      | −43.8% |
| medium  | 5.41 → 5.37 µs   |  −0.7% | 2.98 → 1.75 µs    | −41.4% |
| large   | 104.0 → 86.7 µs  | −16.5% | 50.6 → 33.0 µs    | −35.0% |
| xlarge  | 829 → 690 µs     | −16.3% | 415 → 281 µs      | −32.2% |
| unicode | 174.4 → 116.8 µs | −33.1% | 106.5 → 85.6 µs   | −19.8% |
| numbers | 92.6 → 86.6 µs   |  −6.7% | 111.9 → 60.2 µs   | −46.4% |
| wide    | 163.6 → 166.0 µs |  +1.4% | 145.7 → 66.7 µs   | −53.9% |
| array   | 97.8 → 65.7 µs   | −32.9% | 83.6 → 50.0 µs    | −40.3% |
| records | 125.4 → 104.6 µs | −16.7% | 88.8 → 50.0 µs    | −43.8% |
| deep    | 99.4 → 91.9 µs   |  −7.5% | 122.2 → 66.6 µs   | −45.7% |
| pretty  | 118.5 → 101.4 µs | −14.1% | (parse only)      |        |

- **`stringify` gains the most.** It skips both `JSON.stringify` and
  `JSON.parse`, so #104's encoder speedups now show undiluted. That's the 20–54%
  here, against #104's own 16–48% on `generate`.
- **`parse` gains less, and it varies.** It no longer builds JSON text or
  escapes strings, but it now builds objects, and building them costs about what
  `JSON.parse` did. The biggest gains are where strings needed escaping
  (`unicode`, `small`) or values are plain (`array`). Key-heavy documents
  (`medium`, `wide`) break even: those are mostly object construction, plus the
  check that keeps keys like `__proto__` from running `Object.prototype`'s
  setters.

### Node 20.20, 4 processes

| doc     | `parse` Δ | `stringify` Δ (median) | `stringify` per-process range |
| ------- | --------: | ---------------------: | ----------------------------- |
| small   |    −41.6% |                 −43.6% | −57.4% … −21.3%               |
| medium  |     −6.4% |                 −28.5% | −48.2% … +2.4%                |
| large   |    −22.9% |                 −11.4% | −36.0% … +26.8%               |
| xlarge  |    −24.4% |                  −6.0% | −32.7% … +32.3%               |
| unicode |    −27.8% |                 −10.2% | −23.1% … +9.7%                |
| numbers |    −11.8% |                 −48.9% | −50.3% … −48.6%               |
| wide    |     −2.8% |                 −39.8% | −53.0% … −23.1%               |
| array   |    −38.8% |                 −29.2% | −41.8% … −21.4%               |
| records |    −20.6% |                 −32.5% | −48.4% … −12.2%               |
| deep    |    −10.4% |                 −45.1% | −52.2% … −38.5%               |
| pretty  |    −20.3% |                        |                               |

`parse` is as steady as on Node 24, with every process within a few points.
`stringify` is not: on Node 20 it runs in one of two states, so its medians fall
between them. For `large`, the two states are about 41 µs and about 84 µs,
against 66 µs for A. See the caveat below.

### Against the built-in `JSON` (Node 24.13, 6 processes)

`npm run bench:ab -- JSON .` runs `JSON.parse(json)` and `JSON.stringify(v)` as
side A. Each row is how many times longer #102 takes than the built-in, on the
same document:

| doc     |            `stringify` |                 `parse` |
| ------- | ---------------------: | ----------------------: |
| small   | 2.7× (248 ns vs 93 ns) | 3.6× (488 ns vs 135 ns) |
| medium  |                   3.4× |                    7.4× |
| large   |                   4.5× |                    8.1× |
| xlarge  |                   4.9× |                    8.2× |
| unicode |                   9.7× |                   10.9× |
| numbers |                   2.2× |                    5.4× |
| wide    |                   2.5× |                    3.5× |
| array   |                   3.7× |                    3.6× |
| records |                   2.9× |                    4.4× |
| deep    |                   1.2× |                    2.8× |
| pretty  |                        |                    8.1× |

The built-ins are native code. Emojion documents also run 1.1–3.9 times as many
UTF-16 code units as the same JSON (for example 16,965 against 7,830 for
`large`, and 28,137 against 7,239 for `unicode`, whose text is all escapes).
That is why `unicode` shows the widest gap.

### Noise

Same build on both sides (A/A):

- **Node 24, 6 processes.** Every row's median was within ±1.3%. Per-process
  medians were within ±4%, except `stringify deep` (−7.8% … +8.5%).
- **Node 20, 4 processes.** Every row's median was within +2.5%, and per-process
  medians were within −7% … +6.6%.

### Caveat: `stringify` speed depends on the caller's objects

`stringify()` now walks the caller's objects instead of fresh `JSON.parse`
output, and V8 makes that sensitive to the objects' history. While objects are
being built, V8 deprecates some of their hidden classes (for example, when a
field that held small integers gets a double). The first JavaScript code to walk
those objects migrates them, deoptimizes over and over ("wrong map"), and can
keep slower optimized code afterwards.

- On Node 24, a `stringify` that had first walked the freshly built corpus
  stayed about 1.6× slower on `large` (about 50 µs against 31 µs), for as long
  as I measured.
- Replacing the `toJSON` and unboxing steps with a no-op didn't change that, so
  it comes from walking the objects, not from the `JSON.stringify` rules.
- On Node 20, having the 0.1 build (with its `JSON.parse` calls) in the same
  process was enough to put `stringify` in the slow state in some processes.
  That is the spread in the Node 20 table.

The harness shapes the corpus with a third, untimed instance of the build. That
way the load order doesn't decide which timed build walks the fresh objects
first, and A/A runs stay within the noise above.

Real programs get whatever state their own objects lead to. A first harness run,
without the third instance, put #102 in the slow state in every process. Against
0.1 it was then 15–40% slower on the text-heavy documents (small, medium, large,
xlarge, unicode), and still 16–46% faster on numbers, wide, array and deep. 0.1
largely avoided this because `generate` walked fresh `JSON.parse` output.

## Reproducing

```sh
npm run bench                                           # this build, with JSON.parse/stringify rows
npm run bench:ab -- <base-ref> <candidate-ref>          # Node 24, 4 processes
npm run bench:ab -- <base> <candidate> --node ~/.nvm/versions/node/v20.20.2/bin/node
npm run bench:ab -- <ref> <ref>@es2022                  # compile-target check
npm run bench:ab -- JSON <ref>                          # against the built-in JSON
npm run bench:ab -- <ref> <ref> --ops stringify         # one operation only
```

A 0.1 ref (before #102) is measured through the adapter described at the top, so
it can be compared with a 0.2 ref.

The experiment branches (`exp/*`, `r2/*`, `combo/*`) are local to the machine
that ran them. Each experiment is described precisely enough above to redo.

## Appendix: per-document results

Every cell is the median time change in %. Every cell beyond ±3% had all
processes on the same side of zero.

### Round 1, `parse`, against 0.1.0

| experiment              | small | medium | large | xlarge | unicode | numbers |  wide | array | records |  deep | pretty |
| ----------------------- | ----: | -----: | ----: | -----: | ------: | ------: | ----: | ----: | ------: | ----: | -----: |
| p01-object-table        | +28.1 |  +33.8 | +42.9 |  +43.0 |   +51.4 |   +59.1 | +26.5 | +35.2 |   +24.8 | +18.5 |  +63.5 |
| p02-typed-table         | −21.7 |  −20.6 | −18.8 |  −18.5 |   −20.6 |   −27.5 | −30.6 | −27.7 |   −26.5 | −24.4 |  −19.9 |
| p03-charcodeat          |  +7.1 |   +7.6 |  +8.6 |   +8.7 |   +10.5 |    +8.8 |  +6.4 |  +6.5 |    +6.3 |  +4.8 |  +10.0 |
| p05-inline-next         |  −7.6 |   −6.5 |  −3.9 |   −4.1 |    −0.4 |    −0.2 |  −5.1 |  −5.6 |    −8.5 |  −7.4 |   −3.9 |
| p06-class-state         |  −9.3 |   −8.4 |  −8.0 |   −8.2 |    −4.2 |   −10.7 |  −5.7 |  +0.7 |    −7.4 |  −8.7 |   −8.6 |
| p07-fromcharcode-chunks | −16.2 |  −11.8 | −10.6 |  −11.2 |   −13.9 |    +0.0 |  −4.3 |  +4.8 |    +1.2 |  +7.5 |   −8.6 |
| p08-char-strings        |  −7.2 |   −7.2 |  −4.6 |   −4.7 |    −1.4 |    −7.5 |  −6.8 |  −6.9 |    −8.2 |  −8.2 |   −3.6 |
| p09-array-output        |  +4.7 |   +7.9 |  +2.9 |   +3.4 |    −0.2 |    +9.4 |  +9.6 | +13.0 |   +11.6 | +20.2 |   +2.7 |
| p10-strip-whitespace    | +19.4 |  +17.3 | +17.0 |  +17.8 |   +15.8 |   +22.9 | +13.5 | +14.4 |   +13.6 | +13.5 |  +25.1 |
| p11-dispatch            |  −0.6 |   −0.2 |  −0.2 |   −0.1 |    −0.0 |    −0.5 |  +0.1 |  +0.6 |    −0.3 |  −2.1 |   +0.1 |
| p12-number-scan         |  +0.2 |   −0.0 |  +0.5 |   +0.2 |    −0.4 |    −7.5 |  −0.3 |  −0.6 |    +0.2 |  −1.4 |   +0.1 |
| p13-escape-when-needed  |  −9.6 |   −1.2 |  −3.7 |   −4.2 |    −2.1 |    +0.2 |  −0.6 |  +0.4 |    −2.6 |  −0.1 |   −4.0 |
| p15-fromcharcode-bmp    |  +0.8 |   +0.7 |  +1.1 |   +0.8 |    +1.5 |    −0.3 |  +0.1 |  +0.5 |    +0.2 |  +0.0 |   +1.1 |
| t01-es2022              |  +0.1 |   −0.2 |  −0.1 |   +0.2 |    −0.1 |    +0.1 |  −0.7 |  −0.0 |    −0.2 |  −0.2 |   −0.0 |

### Round 1, `generate`, against 0.1.0

The parser experiments, not shown, were all within ±1.7% here.

| experiment          | small | medium | large | xlarge | unicode | numbers |  wide | array | records |   deep | pretty |
| ------------------- | ----: | -----: | ----: | -----: | ------: | ------: | ----: | ----: | ------: | -----: | -----: |
| g01-key-cache       |  +4.3 |  +15.5 |  −7.2 |   −9.3 |    −4.2 |    −0.7 | +15.6 |  +0.0 |   −19.1 |  −19.7 |   −6.9 |
| g02-ascii-table     | −13.3 |   −9.7 | −27.7 |  −27.0 |    −4.6 |    −0.2 |  −1.6 |  −0.1 |    −3.7 |   −0.2 |  −26.7 |
| g03-number-codes    |  −0.0 |   +0.1 |  −1.1 |   −0.7 |    −0.8 |   −23.7 |  −2.1 |  −6.1 |    −1.3 |   −2.4 |   −0.4 |
| g04-nibble-shifts   |  −9.3 |   −5.4 | −15.5 |  −14.9 |   −42.7 |    −0.2 |  −0.6 |  −0.1 |    −1.5 |   +0.5 |  −15.4 |
| g06-for-in          |  −1.0 |   −0.8 |  −0.4 |   −0.5 |    +0.2 |    +0.9 |  +2.6 |  +0.3 |    −0.3 |   −0.5 |   −0.3 |
| g07-array-join      | +41.2 |  +52.1 | +41.8 |  +78.2 |   +29.4 |   +28.1 | +22.2 | +17.3 |   +31.3 |  +25.6 |  +41.9 |
| g08-pair-table      | −10.3 |  −22.5 |  −6.5 |   −7.3 |    −1.2 |    −0.0 | −12.3 |  −9.6 |   −13.6 |   −9.6 |   −6.3 |
| g09-charcode-buffer | +75.5 | +116.5 | +74.2 |  +75.7 |    +2.5 |    +0.7 | +81.5 | +99.2 |  +168.4 | +144.4 |  +73.1 |
| t01-es2022          |  −0.2 |   +0.2 |  +0.2 |   +0.6 |    +0.2 |    −0.2 |  −0.6 |  −0.2 |    −0.4 |   −0.3 |   +0.2 |

### Round 2, `parse`

The first row is p02 against 0.1.0. Every other row is measured against p02.

| experiment                 | small | medium | large | xlarge | unicode | numbers |  wide | array | records |  deep | pretty |
| -------------------------- | ----: | -----: | ----: | -----: | ------: | ------: | ----: | ----: | ------: | ----: | -----: |
| p02 (vs 0.1.0)             | −23.0 |  −22.0 | −20.0 |  −19.2 |   −20.2 |   −26.4 | −30.7 | −28.6 |   −26.2 | −25.0 |  −20.5 |
| r2-p02-small               |  +6.8 |   +0.1 |  +2.8 |   +3.1 |    +0.9 |    +0.9 |  −1.7 |  +4.5 |    −0.2 |  −2.2 |   +3.9 |
| r2-p03-surrogates          |  +2.0 |   +1.0 |  +2.7 |   +2.8 |    +8.7 |    +1.3 |  +1.4 |  +0.5 |    +2.2 |  +1.1 |   +8.8 |
| r2-p04-parallel            |  +4.5 |   +4.1 |  +5.2 |   +5.3 |    +6.5 |    −0.7 |  +2.9 |  +3.2 |    +1.5 |  +1.3 |   +5.4 |
| r2-p05-inline-next         |  −2.0 |   −1.0 |  +1.6 |   +1.5 |    +2.7 |    +0.4 |  −2.1 |  −2.5 |    −1.5 |  +2.3 |   +0.2 |
| r2-p06-class-state         |  −4.9 |   −4.9 |  −5.1 |   −5.0 |    −8.4 |    −9.3 |  −4.5 |  −0.0 |    −2.5 |  −3.8 |   −7.8 |
| r2-p07-fromcharcode-chunks |  −6.7 |   −1.2 |  −5.9 |   −6.4 |   −13.7 |    −0.6 |  +3.2 | +12.3 |   +15.5 | +26.3 |   −5.3 |
| r2-p08-char-strings        |  −3.3 |   −2.5 |  −2.2 |   −2.5 |    −2.3 |    −3.4 |  −2.5 |  −1.5 |    −4.0 |  −3.5 |   −2.3 |
| r2-p12-number-scan         |  +1.5 |   +0.8 |  +1.0 |   +1.4 |    +0.3 |    −5.0 |  +1.2 |  −0.1 |    +1.1 |  −0.1 |   +0.4 |
| r2-p13-escape-when-needed  | −14.0 |   +1.1 |  −7.3 |   −8.5 |    −5.0 |    +0.3 |  +0.4 |  +0.2 |    −3.9 |  +2.2 |   −6.9 |

### Generator combinations, `generate`

| combination           | small | medium | large | xlarge | unicode | numbers |  wide | array | records |  deep | pretty |
| --------------------- | ----: | -----: | ----: | -----: | ------: | ------: | ----: | ----: | ------: | ----: | -----: |
| g02+g03+g04 vs 0.1.0  | −14.6 |  −10.5 | −28.6 |  −28.4 |   −43.5 |   −24.3 |  −2.3 |  −6.6 |    −5.4 |  −4.7 |  −28.3 |
| + g08, vs g02+g03+g04 | −24.5 |  −26.9 | −25.6 |  −25.6 |    −4.7 |    −0.3 | −14.4 |  −9.7 |   −16.3 |  −7.4 |  −24.5 |
| + g01, vs g02+g03+g04 |  +6.6 |  +20.2 |  −8.4 |  −10.9 |    −4.1 |    +1.0 | +19.7 |  +1.3 |   −20.0 | −19.5 |   −8.1 |

### #102 against master (641e4b8), Node 24.13, 6 processes

Δ is the median; the range is the spread of per-process medians.

| op        | small                 | medium                | large                 | xlarge                | unicode               | numbers               | wide                  | array                 | records               | deep                  | pretty                |
| --------- | --------------------- | --------------------- | --------------------- | --------------------- | --------------------- | --------------------- | --------------------- | --------------------- | --------------------- | --------------------- | --------------------- |
| parse     | −34.5 (−35.2 … −33.2) | −0.7 (−2.2 … +0.8)    | −16.5 (−17.3 … −15.7) | −16.3 (−17.2 … −15.7) | −33.1 (−33.6 … −32.1) | −6.7 (−7.4 … −5.8)    | +1.4 (+0.2 … +3.5)    | −32.9 (−34.2 … −31.5) | −16.7 (−18.2 … −12.1) | −7.5 (−10.2 … −6.0)   | −14.1 (−15.4 … −13.5) |
| stringify | −43.8 (−44.7 … −43.2) | −41.4 (−42.0 … −40.7) | −35.0 (−35.9 … −33.9) | −32.2 (−33.3 … −31.0) | −19.8 (−21.1 … −19.0) | −46.4 (−47.0 … −45.6) | −53.9 (−54.6 … −53.4) | −40.3 (−40.8 … −40.1) | −43.8 (−45.3 … −42.4) | −45.7 (−47.7 … −42.4) |                       |
