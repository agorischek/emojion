import { parse } from '../src/index';

describe('Parser', () => {
  test('Should parse an empty document', () => {
    const document = '🙌✋';
    const parsed = parse(document);
    expect(parsed).toEqual({});
  });

  test('Should parse a document with one property', () => {
    const document = '🙌😃🐬✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ h: 'd' });
  });

  test('Should parse a document with two properties', () => {
    const document = '🙌🥳🌻🤤🕑✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ p: '0', d: 2 });
  });

  test('Should parse a document with a negatie integer value', () => {
    const document = '🙌🤤⏰🕑✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ d: -2 });
  });

  test('Should parse a document with a floating point value', () => {
    const document = '🙌😭🕓🕖⛳️🕗🕐✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ r: 47.81 });
  });

  test('Should parse a document with a negative floating point value', () => {
    const document = '🙌😭⏰🕓🕖⛳️🕗🕐✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ r: -47.81 });
  });

  test('Should parse a document that is only a boolean', () => {
    const document = '🙌💚✋';
    const parsed = parse(document);
    expect(parsed).toEqual(true);
  });

  test('Should parse a document that is only an array', () => {
    const document = '🙌🤜🐜🤝🐢🤝🐌🤛✋';
    const parsed = parse(document);
    expect(parsed).toEqual(['a', 't', 's']);
  });

  test('Should parse a document with an array of objects', () => {
    const document = '🙌🤜👉🥰🐜👈🤝👉🤐🐢👈🤛✋';
    const parsed = parse(document);
    expect(parsed).toEqual([{ l: 'a' }, { z: 't' }]);
  });

  test('Should parse a document with a multicharacter string value', () => {
    const document = '🙌🤫🐜🐢🐌✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ q: 'ats' });
  });

  test('Should parse a document with a multicharacter string key', () => {
    const document = '🙌🤔🙃😭🐝✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ iur: 'b' });
  });

  test('Should parse a document with a multicharacter string and numeral key', () => {
    const document = '🙌😵😿🦋✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ x6: 'u' });
  });

  test('Should parse a document with value containing numerals', () => {
    const document = '🙌😵🌵🌻✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ x: '30' });
  });

  test('Should parse a document with a multicharacter numeric value', () => {
    const document = '🙌😖🕑🕒🕔✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ c: 235 });
  });

  test('Should parse a document with upper case letters', () => {
    const document = '🙌👠🥰👡🐂✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ L: 'X' });
  });

  test('Should parse a document with a one-item array', () => {
    const document = '🙌😉🤜🕗🤛✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ w: [8] });
  });

  test('Should parse a document with a two-item array', () => {
    const document = '🙌😉🤜🕗🤝🕔🤛✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ w: [8, 5] });
  });

  test('Should parse a document with a three-item array', () => {
    const document = '🙌😉🤜🕗🤝🕔🤝🕒🤛✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ w: [8, 5, 3] });
  });

  test('Should parse a document with a complex array', () => {
    const document = '🙌😉🤜🕗🕒🤝🌾🌿🌼🤝🕳🤝🦘🦞🤛✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ w: [83, '678', null, 'kl'] });
  });

  test('Should parse a document with nested arrays', () => {
    const document = '🙌😉🤜🕗🤝🤜🕔🤝🕑🤛🤝🕒🤛✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ w: [8, [5, 2], 3] });
  });

  test('Should parse a document with a subobject', () => {
    const document = '🙌🤑👉🤩🕔👈✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ m: { y: 5 } });
  });

  test('Should parse a document with an empty subobject', () => {
    const document = '🙌🤑👉👈✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ m: {} });
  });

  test('Should parse a document with an empty string key', () => {
    const document = '🙌🗝🕐✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ '': 1 });
  });

  test('Should parse a document with an empty string value', () => {
    const document = '🙌🤑🧵✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ m: '' });
  });

  test('Should keep the last of two identical keys', () => {
    const document = '🙌🤑👉🤩🕔👈🤑👉🤩🕔👈✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ m: { y: 5 } });
  });

  test('Should keep the last value of a repeated key', () => {
    const document = '🙌🤑👉🤩🕔👈🤑👉😿🐋👈✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ m: { '6': 'w' } });
  });

  test('Should parse a document with a four nibble unicode key', () => {
    const document = '🙌🌎🍏🍎🍎🥭🐜✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ Ĝ: 'a' });
  });

  test('Should parse a document with a five nibble unicode key', () => {
    const document = '🙌🌎🍎🥝🍉🍓🥝🐜✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ '🚏': 'a' });
  });

  test('Should parse a document with a four nibble unicode value', () => {
    const document = '🙌😭🗺🖋🖌📕📍✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ r: 'ǧ' });
  });

  test('Should parse a document with a five nibble unicode value', () => {
    const document = '🙌😭🗺🖌📋🖊📓📏✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ r: '🏆' });
  });

  test('Should parse a document with a four nibble unicode key and value', () => {
    const document = '🙌🌎🍏🍎🍎🥭🗺🖋🖌📕📍✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ Ĝ: 'ǧ' });
  });

  test('Should parse a document with a five nibble unicode key and value', () => {
    const document = '🙌🌎🍎🥝🍉🍓🥝🗺🖌📋🖊📓📏✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ '🚏': '🏆' });
  });

  test('Should parse a document with newlines and whitespace', () => {
    const document = '🙌🌎 🍎🥝\n🍉🍓🥝🗺🖌 📋🖊📓📏✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ '🚏': '🏆' });
  });

  test('Should parse a document with a mixed letter and unicode key', () => {
    const document = '🙌😂🌎🍏🍎🍎🥭🤩🐜✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ jĜy: 'a' });
  });

  test('Should parse a document with a mixed letter and unicode value', () => {
    const document = '🙌😭🐖🗺🖋🖌📕📍🦋✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ r: 'iǧu' });
  });

  test('Should parse a document that is only an empty array', () => {
    const document = '🙌🤜🤛✋';
    const parsed = parse(document);
    expect(parsed).toEqual([]);
  });

  test('Should parse a document with an empty array', () => {
    const document = '🙌😠🤜🤛🥺🤜🤜🤛🤝🤜🤛🤛✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ a: [], b: [[], []] });
  });

  test('Should parse a document that is only a string', () => {
    const document = '🙌👡🦔🐖✋';
    const parsed = parse(document);
    expect(parsed).toEqual('Hi');
  });

  test('Should parse a document that is only an empty string', () => {
    const document = '🙌🧵✋';
    const parsed = parse(document);
    expect(parsed).toEqual('');
  });

  test('Should parse a document that is only a number', () => {
    const document = '🙌⏰🕓🕑✋';
    const parsed = parse(document);
    expect(parsed).toEqual(-42);
  });

  test('Should parse a document with a positive exponent', () => {
    const document = '🙌😠🕐🚀🕑🕐✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ a: 1e21 });
  });

  test('Should parse a document with a negative exponent', () => {
    const document = '🙌😠🕐⛳️🕔🚀⏰🕖✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ a: 1.5e-7 });
  });

  test('Should keep quotes, backslashes and control characters', () => {
    const document = '🙌🌎🍐🍐🗺🖍🖍🗺📐📓🗺📎🗺🖋✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ '"': '"\\\n\u0000' });
  });

  test('Should parse unicode escapes padded to six nibbles', () => {
    expect(parse('🙌😠🗺🖋🖋🖋🖋🖋🖌✋')).toEqual({ a: '\u0001' });
    expect(parse('🙌🌎🍏🍏🍏🍊🍈🍓🐜✋')).toEqual({ Θ: 'a' });
    expect(parse('🙌😠🗺🖌🖋📋📋📋📋✋')).toEqual({ a: '\u{10ffff}' });
  });

  test('Should parse a document with variation selectors', () => {
    const document = '🙌😠🕳\ufe0f🥺🕐⛳\ufe0f🕐✋';
    const parsed = parse(document);
    expect(parsed).toEqual({ a: null, b: 1.1 });
  });

  test('Should parse negative zero', () => {
    expect(Object.is(parse('🙌⏰🕛✋'), -0)).toBe(true);
    expect(Object.is(parse('🙌🕛✋'), 0)).toBe(true);
  });

  test('Should parse numbers as JSON.parse() does', () => {
    expect(parse('🙌🕐🚀🕑🕐✋')).toBe(1e21);
    expect(parse('🙌🕐🚀🕒🕐🕛✋')).toBe(Infinity);
    expect(parse('🙌🕐🚀⏰🕓🕛🕛✋')).toBe(0);
    expect(parse('🙌🕘🕛🕛🕖🕐🕘🕘🕑🕔🕓🕖🕓🕛🕘🕘🕒✋')).toBe(
      JSON.parse('9007199254740993')
    );
  });

  test('Should make __proto__ an own property, not the prototype', () => {
    // _ has no key emoji of its own, so it is written as 🌎🍌🥝 (U+5F).
    const key = '🌎🍌🥝🌎🍌🥝🥳😭😮😛😮🌎🍌🥝🌎🍌🥝';
    const parsed = parse('🙌' + key + '👉😠🕐👈✋') as Record<string, unknown>;
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype);
    expect(Object.keys(parsed)).toEqual(['__proto__']);
    expect(Object.getOwnPropertyDescriptor(parsed, '__proto__')).toEqual({
      value: { a: 1 },
      writable: true,
      enumerable: true,
      configurable: true,
    });
    expect(parsed.a).toBeUndefined();
    expect(parsed).toEqual(JSON.parse('{"__proto__":{"a":1}}'));
  });

  test('Should keep the first position of a repeated key', () => {
    const parsed = parse('🙌😠🕐🥺🕑😠🕒✋');
    expect(parsed).toEqual({ a: 3, b: 2 });
    expect(Object.keys(parsed as object)).toEqual(['a', 'b']);
    expect(parsed).toEqual(JSON.parse('{"a":1,"b":2,"a":3}'));
  });

  test('Should not run setters inherited from Object.prototype', () => {
    const set = vi.fn();
    Object.defineProperty(Object.prototype, 'b', { set, configurable: true });
    try {
      const parsed = parse('🙌🥺🕐✋');
      expect(set).not.toHaveBeenCalled();
      expect(Object.getOwnPropertyDescriptor(parsed, 'b')?.value).toBe(1);
    } finally {
      delete (Object.prototype as Record<string, unknown>).b;
    }
  });

  test('Should not trip over read-only properties of Object.prototype', () => {
    Object.defineProperty(Object.prototype, 'b', {
      value: 0,
      writable: false,
      configurable: true,
    });
    try {
      const parsed = parse('🙌🥺🕐✋');
      expect(Object.getOwnPropertyDescriptor(parsed, 'b')?.value).toBe(1);
    } finally {
      delete (Object.prototype as Record<string, unknown>).b;
    }
  });

  test('Should parse into plain objects and arrays', () => {
    const parsed = parse('🙌😠🤜👉👈🤛✋') as { a: object[] };
    expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype);
    expect(Array.isArray(parsed.a)).toBe(true);
    expect(Object.getPrototypeOf(parsed.a[0])).toBe(Object.prototype);
  });

  test.each([
    ['an empty input', '', /end of Emojion input/],
    ['a missing start', '😠🐜✋', /Unexpected "😠" in Emojion at position 0/],
    ['a missing end', '🙌😠🐜', /end of Emojion input/],
    ['trailing content', '🙌✋✋', /Unexpected "✋" in Emojion at position 3/],
    [
      'an invalid character',
      '🙌💩✋',
      /Unexpected "💩" in Emojion at position 2/,
    ],
    ['a key without a value', '🙌😠✋', /Unexpected "✋"/],
    ['a value without a key', '🙌😠🐜🕐✋', /Unexpected "🕐"/],
    ['an upper case numeral', '🙌😠👡🌷✋', /Unexpected "🌷"/],
    ['a unicode modifier without nibbles', '🙌😠🗺✋', /Unexpected "✋"/],
    ['a code point that is too large', '🙌😠🗺🖌🖌🖋🖋🖋🖋✋', /Unexpected "🖋"/],
    ['a value escape over six nibbles', '🙌😠🗺🖋🖋🖋🖋🖋🖋🖌✋', /Unexpected "🖌"/],
    [
      'a key escape over six nibbles',
      '🙌🌎🍏🍏🍏🍏🍏🍏🍎🐜✋',
      /Unexpected "🍎"/,
    ],
    ['a leading zero', '🙌😠🕛🕐✋', /Unexpected "🕐"/],
    ['a decimal without digits', '🙌😠🕐⛳️✋', /Unexpected "✋"/],
    ['an unclosed array', '🙌😠🤜🕐✋', /Unexpected "✋"/],
    ['a trailing array delimiter', '🙌😠🤜🕐🤝🤛✋', /Unexpected "🤛"/],
    ['an unclosed object', '🙌😠👉🥺🕐✋', /Unexpected "✋"/],
    [
      'a wrapped top-level object',
      '🙌👉😠🐜👈✋',
      /Unexpected "👉" in Emojion at position 2/,
    ],
    ['a wrapped empty top-level object', '🙌👉👈✋', /Unexpected "👉"/],
  ])('Should throw on %s', (_, document, message) => {
    expect(() => parse(document)).toThrow(SyntaxError);
    expect(() => parse(document)).toThrow(message);
  });

  const arrays = (depth: number) =>
    '🙌' + '🤜'.repeat(depth) + '🤛'.repeat(depth) + '✋';
  const objects = (depth: number) =>
    '🙌' + '😠👉'.repeat(depth) + '👈'.repeat(depth) + '✋';

  const nestedArrays = (depth: number) => {
    let value: unknown = [];
    for (let i = 1; i < depth; i++) value = [value];
    return value;
  };
  const nestedObjects = (depth: number) => {
    let value: unknown = {};
    for (let i = 0; i < depth; i++) value = { a: value };
    return value;
  };

  test('Should parse nesting up to the limit', () => {
    expect(parse(arrays(512))).toEqual(nestedArrays(512));
    expect(parse(objects(512))).toEqual(nestedObjects(512));
  });

  test('Should throw on nesting past the limit', () => {
    expect(() => parse(arrays(513))).toThrow(
      /nesting exceeds 512 levels at position 1026/
    );
    expect(() => parse(objects(513))).toThrow(SyntaxError);
  });

  test('Should throw a SyntaxError on very deep nesting', () => {
    expect(() => parse(arrays(10000))).toThrow(SyntaxError);
    expect(parse('🙌😠🐜✋')).toEqual({ a: 'a' });
  });
});
