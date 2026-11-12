import { characters } from './characters';
import type { Json } from './json';
import { MAX_DEPTH } from './limits';

const Kind = {
  EOF: 0,
  Invalid: 1,
  Space: 2,
  Start: 3,
  End: 4,
  Indent: 5,
  Outdent: 6,
  Open: 7,
  Close: 8,
  Delimit: 9,
  KeyChar: 10,
  KeyUpper: 11,
  KeyUnicode: 12,
  KeyNibble: 13,
  KeyEmpty: 14,
  ValueChar: 15,
  ValueUpper: 16,
  ValueUnicode: 17,
  ValueNibble: 18,
  ValueEmpty: 19,
  Digit: 20,
  Decimal: 21,
  Exponent: 22,
  Negative: 23,
  True: 24,
  False: 25,
  Null: 26,
} as const;

// Each token is `kind | code << 8`, looked up by code point in a typed array:
// one for the BMP (where spaces and a few emoji live) and one for the block
// of astral emoji, U+1F300–U+1FAFF. Unlisted code points stay Invalid.
// This makes parse() 19–31% faster than a Map did (see bench/RESULTS.md).
const ASTRAL_START = 0x1f300;
const ASTRAL_SIZE = 0x800;
const BMP_TOKENS = new Uint16Array(0x10000).fill(Kind.Invalid);
const ASTRAL_TOKENS = new Uint16Array(ASTRAL_SIZE).fill(Kind.Invalid);

function lookup(point: number): number {
  if (point < 0x10000) return BMP_TOKENS[point];
  const offset = point - ASTRAL_START;
  return offset >= 0 && offset < ASTRAL_SIZE
    ? ASTRAL_TOKENS[offset]
    : Kind.Invalid;
}

function setToken(point: number, token: number) {
  const offset = point - ASTRAL_START;
  if (point < 0x10000) BMP_TOKENS[point] = token;
  else if (offset >= 0 && offset < ASTRAL_SIZE) ASTRAL_TOKENS[offset] = token;
  else throw new Error(`U+${point.toString(16)} is outside the token table`);
}

const define = (emoji: string, kind: number, code = 0) => {
  setToken(emoji.codePointAt(0)!, kind | (code << 8));
};

define(characters.document.start, Kind.Start);
define(characters.document.end, Kind.End);
define(characters.document.indent, Kind.Indent);
define(characters.document.outdent, Kind.Outdent);
define(characters.document.arrayOpen, Kind.Open);
define(characters.document.arrayClose, Kind.Close);
define(characters.document.arrayDelimit, Kind.Delimit);
define(characters.keys.modifiers.upperCase, Kind.KeyUpper);
define(characters.keys.modifiers.unicode, Kind.KeyUnicode);
define(characters.keys.other.empty, Kind.KeyEmpty);
define(characters.values.modifiers.upperCase, Kind.ValueUpper);
define(characters.values.modifiers.unicode, Kind.ValueUnicode);
define(characters.values.modifiers.negative, Kind.Negative);
define(characters.values.other.emptyString, Kind.ValueEmpty);
define(characters.values.other.null, Kind.Null);
define(characters.values.booleans.true, Kind.True);
define(characters.values.booleans.false, Kind.False);

for (const [char, emoji] of Object.entries(characters.keys.letters)) {
  define(emoji, Kind.KeyChar, char.charCodeAt(0));
}
for (const [char, emoji] of Object.entries(characters.keys.numerals)) {
  define(emoji, Kind.KeyChar, char.charCodeAt(0));
}
for (const [hex, emoji] of Object.entries(characters.keys.unicode)) {
  define(emoji, Kind.KeyNibble, parseInt(hex, 16));
}
for (const [char, emoji] of Object.entries(characters.values.letters)) {
  define(emoji, Kind.ValueChar, char.charCodeAt(0));
}
for (const [char, emoji] of Object.entries(characters.values.numerals)) {
  define(emoji, Kind.ValueChar, char.charCodeAt(0));
}
for (const [hex, emoji] of Object.entries(characters.values.unicode)) {
  define(emoji, Kind.ValueNibble, parseInt(hex, 16));
}
for (const [char, emoji] of Object.entries(characters.values.numbers)) {
  const kind =
    char === '.' ? Kind.Decimal : char === 'e' ? Kind.Exponent : Kind.Digit;
  define(emoji, kind, char.charCodeAt(0));
}

// every /\s/ character, plus the variation selector some emoji carry
for (const space of [
  0x9, 0xa, 0xb, 0xc, 0xd, 0x20, 0xa0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003,
  0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x2028, 0x2029,
  0x202f, 0x205f, 0x3000, 0xfeff, 0xfe0f,
]) {
  setToken(space, Kind.Space);
}

const OBJECT_PROTOTYPE = Object.prototype;

let source = '';
let index = 0;
let at = 0;
let point = 0;
let kind: number = Kind.EOF;
let code = 0;
let depth = 0;

function next(): number {
  while (index < source.length) {
    at = index;
    point = source.codePointAt(index)!;
    index += point > 0xffff ? 2 : 1;
    const token = lookup(point);
    if (token === Kind.Space) continue;
    kind = token & 0xff;
    code = token >> 8;
    return kind;
  }
  at = index;
  kind = Kind.EOF;
  return kind;
}

function fail(): never {
  if (kind === Kind.EOF) {
    throw new SyntaxError('Unexpected end of Emojion input');
  }
  throw new SyntaxError(
    `Unexpected "${String.fromCodePoint(point)}" in Emojion at position ${at}`
  );
}

function nest() {
  if (++depth > MAX_DEPTH) {
    throw new SyntaxError(
      `Emojion nesting exceeds ${MAX_DEPTH} levels at position ${at}`
    );
  }
}

function expect(expected: number) {
  if (kind !== expected) fail();
  next();
}

function text(
  char: number,
  upper: number,
  unicode: number,
  nibble: number
): string {
  let out = '';
  for (;;) {
    if (kind === char) {
      out += String.fromCharCode(code);
      next();
    } else if (kind === upper) {
      next();
      if (kind !== char || code < 97) fail();
      out += String.fromCharCode(code - 32);
      next();
    } else if (kind === unicode) {
      next();
      if (kind !== nibble) fail();
      // U+10FFFF, the highest code point, needs six nibbles.
      let value = 0;
      let nibbles = 0;
      do {
        if (++nibbles > 6) fail();
        value = value * 16 + code;
        if (value > 0x10ffff) fail();
        next();
      } while (kind === nibble);
      out += String.fromCodePoint(value);
    } else {
      return out;
    }
  }
}

function digits(): string {
  if (kind !== Kind.Digit) fail();
  let out = '';
  do {
    out += String.fromCharCode(code);
    next();
  } while (kind === Kind.Digit);
  return out;
}

function number(): number {
  let out = '';
  if (kind === Kind.Negative) {
    out = '-';
    next();
  }
  if (kind === Kind.Digit && code === 48) {
    out += '0';
    next();
    if (kind === Kind.Digit) fail();
  } else {
    out += digits();
  }
  if (kind === Kind.Decimal) {
    next();
    out += '.' + digits();
  }
  if (kind === Kind.Exponent) {
    if (next() === Kind.Negative) {
      out += 'e-';
      next();
    } else {
      out += 'e';
    }
    out += digits();
  }
  return Number(out);
}

function members(close: number): { [key: string]: Json } {
  const out: { [key: string]: Json } = {};
  while (kind !== close) {
    let key = '';
    if (kind === Kind.KeyEmpty) {
      next();
    } else if (
      kind === Kind.KeyChar ||
      kind === Kind.KeyUpper ||
      kind === Kind.KeyUnicode
    ) {
      key = text(Kind.KeyChar, Kind.KeyUpper, Kind.KeyUnicode, Kind.KeyNibble);
    } else {
      fail();
    }
    const item = value();
    if (key in OBJECT_PROTOTYPE) {
      // Assigning a key that out inherits would run its setter (__proto__
      // would set the prototype) or fail if it is read-only. Define it as
      // an own property instead, as JSON.parse() does.
      Object.defineProperty(out, key, {
        value: item,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else {
      // A repeated key overwrites the earlier one: the last wins.
      out[key] = item;
    }
  }
  return out;
}

function array(): Json[] {
  const out: Json[] = [];
  if (next() === Kind.Close) {
    next();
    return out;
  }
  out.push(value());
  while (kind === Kind.Delimit) {
    next();
    out.push(value());
  }
  expect(Kind.Close);
  return out;
}

function value(): Json {
  switch (kind) {
    case Kind.Indent: {
      nest();
      next();
      const out = members(Kind.Outdent);
      next();
      depth--;
      return out;
    }
    case Kind.Open: {
      nest();
      const out = array();
      depth--;
      return out;
    }
    case Kind.True:
      next();
      return true;
    case Kind.False:
      next();
      return false;
    case Kind.Null:
      next();
      return null;
    case Kind.ValueEmpty:
      next();
      return '';
    case Kind.Negative:
    case Kind.Digit:
      return number();
    case Kind.ValueChar:
    case Kind.ValueUpper:
    case Kind.ValueUnicode:
      return text(
        Kind.ValueChar,
        Kind.ValueUpper,
        Kind.ValueUnicode,
        Kind.ValueNibble
      );
  }
  return fail();
}

/**
 * Parse an Emojion document into the value it holds, as `JSON.parse()` parses
 * JSON text.
 *
 * Objects come back as plain objects and arrays as plain arrays. A key that
 * `Object.prototype` has, such as `__proto__`, becomes an ordinary own
 * property and never changes the prototype. When a key repeats, the last
 * value wins.
 *
 * @param emojion - The document, from `🙌` to `✋`. Whitespace and U+FE0F
 * variation selectors anywhere in it are ignored.
 * @returns The object, array, string, number, boolean or `null` it holds.
 * @throws {SyntaxError} If the document is not valid Emojion, naming the
 * unexpected emoji and its position, or if it nests arrays and objects more
 * than 512 levels deep.
 *
 * @example
 * parse('🙌😶😠🤑😳👡🐘🐁🦉🦒🐖🦉🦏✋');
 * //=> { name: 'Emojion' }
 *
 * @example
 * parse('🙌🤜🕐🤝💚🤝🕳🤛✋');
 * //=> [1, true, null]
 */
export const parse = (emojion: string): Json => {
  source = emojion;
  index = 0;
  depth = 0;
  try {
    next();
    expect(Kind.Start);
    // A top-level object is written without 👉👈.
    if (kind === Kind.Indent) fail();
    const out =
      kind === Kind.End ||
      kind === Kind.KeyEmpty ||
      kind === Kind.KeyChar ||
      kind === Kind.KeyUpper ||
      kind === Kind.KeyUnicode
        ? members(Kind.End)
        : value();
    expect(Kind.End);
    if (kind !== Kind.EOF) fail();
    return out;
  } finally {
    source = '';
  }
};
