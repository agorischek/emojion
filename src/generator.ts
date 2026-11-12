import { characters } from './characters';
import { MAX_DEPTH } from './limits';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * How to write text as either keys or values. `ascii` holds the emoji for
 * every ASCII character, including the escape sequence for those without
 * their own emoji, so ASCII text never takes the slower escape path.
 * `pairs` caches two ASCII characters at once; it is filled in as pairs are
 * first seen and holds at most 128 × 128 entries.
 */
interface Alphabet {
  ascii: string[];
  pairs: string[];
  unicode: string;
  nibbles: string[];
}

function makeAlphabet(
  letters: Record<string, string>,
  numerals: Record<string, string>,
  modifiers: { upperCase: string; unicode: string },
  hex: Record<string, string>
): Alphabet {
  const result: Alphabet = {
    ascii: [],
    pairs: new Array(128 * 128),
    unicode: modifiers.unicode,
    nibbles: Array.from({ length: 16 }, (_, i) => hex[i.toString(16)]),
  };
  for (let c = 0; c < 128; c++) result.ascii[c] = escapeSequence(c, result);
  for (const [char, emoji] of Object.entries(letters)) {
    result.ascii[char.charCodeAt(0)] = emoji;
    result.ascii[char.toUpperCase().charCodeAt(0)] =
      modifiers.upperCase + emoji;
  }
  for (const [char, emoji] of Object.entries(numerals)) {
    result.ascii[char.charCodeAt(0)] = emoji;
  }
  return result;
}

const KEYS = makeAlphabet(
  characters.keys.letters,
  characters.keys.numerals,
  characters.keys.modifiers,
  characters.keys.unicode
);
const VALUES = makeAlphabet(
  characters.values.letters,
  characters.values.numerals,
  characters.values.modifiers,
  characters.values.unicode
);

// Indexed by the char codes of String(number).
const NUMBERS: string[] = [];
for (const [char, emoji] of Object.entries({
  ...characters.values.numbers,
  '-': characters.values.modifiers.negative,
  '+': '',
})) {
  NUMBERS[char.charCodeAt(0)] = emoji;
}

/** The escape for a code point: the unicode modifier, then its hex digits. */
function escapeSequence(point: number, alphabet: Alphabet): string {
  let shift = 20;
  while (shift > 0 && point >> shift === 0) shift -= 4;
  let out = alphabet.unicode;
  for (; shift >= 0; shift -= 4) out += alphabet.nibbles[(point >> shift) & 15];
  return out;
}

function encode(text: string, alphabet: Alphabet): string {
  const { ascii, pairs } = alphabet;
  let out = '';
  let i = 0;
  while (i < text.length) {
    const c = text.charCodeAt(i);
    if (c < 128) {
      const d = i + 1 < text.length ? text.charCodeAt(i + 1) : 128;
      if (d < 128) {
        const pair = (c << 7) | d;
        let emoji = pairs[pair];
        if (emoji === undefined) emoji = pairs[pair] = ascii[c] + ascii[d];
        out += emoji;
        i += 2;
      } else {
        out += ascii[c];
        i++;
      }
      continue;
    }
    const point = text.codePointAt(i)!;
    i += point > 0xffff ? 2 : 1;
    out += escapeSequence(point, alphabet);
  }
  return out;
}

function nest(depth: number): number {
  if (depth >= MAX_DEPTH) {
    throw new RangeError(
      `JSON nesting exceeds ${MAX_DEPTH} levels, the most Emojion supports`
    );
  }
  return depth + 1;
}

function encodeObject(object: { [key: string]: Json }, depth: number): string {
  let out = '';
  for (const key of Object.keys(object)) {
    out += key ? encode(key, KEYS) : characters.keys.other.empty;
    out += encodeValue(object[key], depth);
  }
  return out;
}

function encodeValue(value: Json, depth: number): string {
  if (typeof value === 'string') {
    return value ? encode(value, VALUES) : characters.values.other.emptyString;
  }
  if (typeof value === 'number') {
    const digits = String(value);
    let out = '';
    for (let i = 0; i < digits.length; i++) {
      out += NUMBERS[digits.charCodeAt(i)];
    }
    return out;
  }
  if (typeof value === 'boolean') {
    return value
      ? characters.values.booleans.true
      : characters.values.booleans.false;
  }
  if (value === null) return characters.values.other.null;
  const inner = nest(depth);
  if (Array.isArray(value)) {
    let out = characters.document.arrayOpen;
    for (let i = 0; i < value.length; i++) {
      if (i) out += characters.document.arrayDelimit;
      out += encodeValue(value[i], inner);
    }
    return out + characters.document.arrayClose;
  }
  return (
    characters.document.indent +
    encodeObject(value, inner) +
    characters.document.outdent
  );
}

/**
 * Convert JSON text into an Emojion document.
 *
 * @example
 * generate('{"created":2019}');
 * //=> '🙌😖😭😳😠😛😳🤤🕑🕛🕐🕘✋'
 */
export const generate = (input: string): string => {
  const value: Json = JSON.parse(input);
  const body =
    value && typeof value === 'object' && !Array.isArray(value)
      ? encodeObject(value, 0)
      : encodeValue(value, 0);
  return characters.document.start + body + characters.document.end;
};
