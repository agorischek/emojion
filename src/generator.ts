import { characters } from './characters';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

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

function encodeObject(object: { [key: string]: Json }): string {
  let out = '';
  for (const key of Object.keys(object)) {
    out += key
      ? encode(key, KEYS, characters.keys.modifiers.unicode, KEY_NIBBLES)
      : characters.keys.other.empty;
    out += encodeValue(object[key]);
  }
  return out;
}

function encodeValue(value: Json): string {
  if (typeof value === 'string') {
    return value
      ? encode(
          value,
          VALUES,
          characters.values.modifiers.unicode,
          VALUE_NIBBLES
        )
      : characters.values.other.emptyString;
  }
  if (typeof value === 'number') {
    let out = '';
    for (const char of String(value)) out += NUMBERS[char];
    return out;
  }
  if (typeof value === 'boolean') {
    return value
      ? characters.values.booleans.true
      : characters.values.booleans.false;
  }
  if (value === null) return characters.values.other.null;
  if (Array.isArray(value)) {
    let out = characters.document.arrayOpen;
    for (let i = 0; i < value.length; i++) {
      if (i) out += characters.document.arrayDelimit;
      out += encodeValue(value[i]);
    }
    return out + characters.document.arrayClose;
  }
  return (
    characters.document.indent +
    encodeObject(value) +
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
      ? encodeObject(value)
      : encodeValue(value);
  return characters.document.start + body + characters.document.end;
};
