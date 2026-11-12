import { characters } from './characters';
import { MAX_DEPTH } from './limits';

const KEYS = Array.from({ length: 128 }, () => '');
const VALUES = Array.from({ length: 128 }, () => '');

for (const [char, emoji] of Object.entries(characters.keys.letters)) {
  KEYS[char.charCodeAt(0)] = emoji;
  KEYS[char.toUpperCase().charCodeAt(0)] =
    characters.keys.modifiers.upperCase + emoji;
}
for (const [char, emoji] of Object.entries(characters.keys.numerals)) {
  KEYS[char.charCodeAt(0)] = emoji;
}
for (const [char, emoji] of Object.entries(characters.values.letters)) {
  VALUES[char.charCodeAt(0)] = emoji;
  VALUES[char.toUpperCase().charCodeAt(0)] =
    characters.values.modifiers.upperCase + emoji;
}
for (const [char, emoji] of Object.entries(characters.values.numerals)) {
  VALUES[char.charCodeAt(0)] = emoji;
}

const KEY_NIBBLES: Record<string, string> = characters.keys.unicode;
const VALUE_NIBBLES: Record<string, string> = characters.values.unicode;

const NUMBERS: Record<string, string> = {
  ...characters.values.numbers,
  '-': characters.values.modifiers.negative,
  '+': '',
};

function encode(
  text: string,
  table: string[],
  unicode: string,
  nibbles: Record<string, string>
): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const emoji = table[text.charCodeAt(i)];
    if (emoji) {
      out += emoji;
      continue;
    }
    const point = text.codePointAt(i)!;
    if (point > 0xffff) i++;
    out += unicode;
    for (const hex of point.toString(16)) out += nibbles[hex];
  }
  return out;
}

const NULL = characters.values.other.null;
const TRUE = characters.values.booleans.true;
const FALSE = characters.values.booleans.false;
const EMPTY_STRING = characters.values.other.emptyString;
const EMPTY_KEY = characters.keys.other.empty;
const INDENT = characters.document.indent;
const OUTDENT = characters.document.outdent;
const OPEN = characters.document.arrayOpen;
const CLOSE = characters.document.arrayClose;
const DELIMIT = characters.document.arrayDelimit;

type Holder = { [key: string]: unknown };

// The objects being written, outermost first, to catch circular structures.
let ancestors: object[] = [];

const toTag = Object.prototype.toString;

function nest(value: object, depth: number): number {
  if (ancestors.indexOf(value) !== -1) {
    throw new TypeError('Converting circular structure to Emojion');
  }
  if (depth >= MAX_DEPTH) {
    throw new RangeError(
      `Value nesting exceeds ${MAX_DEPTH} levels, the most Emojion supports`
    );
  }
  ancestors.push(value);
  return depth + 1;
}

function is(check: () => unknown): boolean {
  try {
    check();
    return true;
  } catch {
    return false;
  }
}

/**
 * Turn a boxed primitive back into its primitive, as JSON.stringify() does.
 * The tag check is cheap; the valueOf() brand check confirms it.
 */
function unbox(value: object): unknown {
  switch (toTag.call(value)) {
    case '[object Number]':
      return is(() => Number.prototype.valueOf.call(value))
        ? Number(value)
        : value;
    case '[object String]':
      return is(() => String.prototype.valueOf.call(value))
        ? String(value)
        : value;
    case '[object Boolean]':
      return is(() => Boolean.prototype.valueOf.call(value))
        ? Boolean.prototype.valueOf.call(value)
        : value;
    case '[object BigInt]':
      return typeof BigInt === 'function' &&
        is(() => BigInt.prototype.valueOf.call(value))
        ? BigInt.prototype.valueOf.call(value)
        : value;
  }
  return value;
}

/**
 * Apply toJSON() and unwrap boxed primitives, the steps JSON.stringify()
 * takes before it looks at a value's type.
 */
function resolve(value: unknown, key: string | number): unknown {
  if (typeof value === 'object') {
    if (value === null) return value;
    const toJSON = (value as { toJSON?: unknown }).toJSON;
    if (typeof toJSON === 'function') {
      value = toJSON.call(value, String(key));
      if (typeof value !== 'object' || value === null) return value;
    }
    if (Array.isArray(value)) return value;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null
      ? value
      : unbox(value as object);
  }
  if (typeof value === 'bigint') {
    const toJSON = (value as unknown as { toJSON?: unknown }).toJSON;
    if (typeof toJSON === 'function') return toJSON.call(value, String(key));
  }
  return value;
}

function encodeMembers(object: Holder, depth: number): string {
  let out = '';
  const keys = Object.keys(object);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = encodeValue(resolve(object[key], key), depth);
    if (value === undefined) continue;
    out += key
      ? encode(key, KEYS, characters.keys.modifiers.unicode, KEY_NIBBLES)
      : EMPTY_KEY;
    out += value;
  }
  return out;
}

function encodeArray(array: unknown[], depth: number): string {
  let out = OPEN;
  for (let i = 0; i < array.length; i++) {
    if (i) out += DELIMIT;
    const value = encodeValue(resolve(array[i], i), depth);
    out += value === undefined ? NULL : value;
  }
  return out + CLOSE;
}

/**
 * Write a resolved value. Returns undefined for the values JSON.stringify()
 * skips: undefined, functions and symbols.
 */
function encodeValue(value: unknown, depth: number): string | undefined {
  switch (typeof value) {
    case 'string':
      return value
        ? encode(
            value,
            VALUES,
            characters.values.modifiers.unicode,
            VALUE_NIBBLES
          )
        : EMPTY_STRING;
    case 'number': {
      // NaN and ±Infinity become null; String(-0) is already '0'.
      if (!isFinite(value)) return NULL;
      let out = '';
      const digits = String(value);
      for (let i = 0; i < digits.length; i++) out += NUMBERS[digits[i]];
      return out;
    }
    case 'boolean':
      return value ? TRUE : FALSE;
    case 'bigint':
      throw new TypeError('Do not know how to serialize a BigInt');
    case 'object': {
      if (value === null) return NULL;
      const inner = nest(value, depth);
      const out = Array.isArray(value)
        ? encodeArray(value, inner)
        : INDENT + encodeMembers(value as Holder, inner) + OUTDENT;
      ancestors.pop();
      return out;
    }
  }
  return undefined;
}

/**
 * Write a value as an Emojion document, the way `JSON.stringify()` writes
 * JSON text. It follows the same rules: it calls `toJSON()`, unwraps boxed
 * primitives, writes `NaN` and `±Infinity` as `null`, skips `undefined`,
 * functions and symbols in objects and writes them as `null` in arrays.
 *
 * Throws a `TypeError` for a BigInt, a circular structure, or a value that
 * Emojion cannot hold at all (`undefined`, a function or a symbol), and a
 * `RangeError` for nesting deeper than 512 levels.
 *
 * @example
 * stringify({ created: 2019 });
 * //=> '🙌😖😭😳😠😛😳🤤🕑🕛🕐🕘✋'
 */
export const stringify = (value: unknown): string => {
  // A toJSON() method may call stringify() itself, so keep the outer stack.
  const outer = ancestors;
  ancestors = [];
  try {
    const resolved = resolve(value, '');
    let body: string | undefined;
    if (
      typeof resolved === 'object' &&
      resolved !== null &&
      !Array.isArray(resolved)
    ) {
      // A top-level object is written without 👉👈.
      ancestors.push(resolved);
      body = encodeMembers(resolved as Holder, 0);
    } else {
      body = encodeValue(resolved, 0);
    }
    if (body === undefined) {
      throw new TypeError(`Emojion cannot hold ${String(typeof resolved)}`);
    }
    return characters.document.start + body + characters.document.end;
  } finally {
    ancestors = outer;
  }
};
