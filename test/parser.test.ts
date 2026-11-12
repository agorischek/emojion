import { parse } from '../src/index';

const validateJSON = (document: string) =>
  expect(JSON.parse(document)).toBeTruthy();

describe('Parser', () => {
  test('Should parse an empty document', () => {
    const document = '🙌✋';
    const parsed = parse(document);
    expect(parsed).toEqual('{}');
    validateJSON(parsed);
  });

  test('Should parse a document with one property', () => {
    const document = '🙌😃🐬✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"h":"d"}');
    validateJSON(parsed);
  });

  test('Should parse a document with two properties', () => {
    const document = '🙌🥳🌻🤤🕑✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"p":"0","d":2}');
    validateJSON(parsed);
  });

  test('Should parse a document with a negatie integer value', () => {
    const document = '🙌🤤⏰🕑✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"d":-2}');
    validateJSON(parsed);
  });

  test('Should parse a document with a floating point value', () => {
    const document = '🙌😭🕓🕖⛳️🕗🕐✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"r":47.81}');
    validateJSON(parsed);
  });

  test('Should parse a document with a negative floating point value', () => {
    const document = '🙌😭⏰🕓🕖⛳️🕗🕐✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"r":-47.81}');
    validateJSON(parsed);
  });

  test('Should parse a document that is only a boolean', () => {
    const document = '🙌💚✋';
    const parsed = parse(document);
    expect(parsed).toBe('true');
  });

  test('Should parse a document that is only an array', () => {
    const document = '🙌🤜🐜🤝🐢🤝🐌🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('["a","t","s"]');
  });

  test('Should parse a document with an array of objects', () => {
    const document = '🙌🤜👉🥰🐜👈🤝👉🤐🐢👈🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('[{"l":"a"},{"z":"t"}]');
  });

  test('Should parse a document with a multicharacter string value', () => {
    const document = '🙌🤫🐜🐢🐌✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"q":"ats"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a multicharacter string key', () => {
    const document = '🙌🤔🙃😭🐝✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"iur":"b"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a multicharacter string and numeral key', () => {
    const document = '🙌😵😿🦋✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"x6":"u"}');
    validateJSON(parsed);
  });

  test('Should parse a document with value containing numerals', () => {
    const document = '🙌😵🌵🌻✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"x":"30"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a multicharacter numeric value', () => {
    const document = '🙌😖🕑🕒🕔✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"c":235}');
    validateJSON(parsed);
  });

  test('Should parse a document with upper case letters', () => {
    const document = '🙌👠🥰👡🐂✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"L":"X"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a one-item array', () => {
    const document = '🙌😉🤜🕗🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"w":[8]}');
    validateJSON(parsed);
  });

  test('Should parse a document with a two-item array', () => {
    const document = '🙌😉🤜🕗🤝🕔🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"w":[8,5]}');
    validateJSON(parsed);
  });

  test('Should parse a document with a three-item array', () => {
    const document = '🙌😉🤜🕗🤝🕔🤝🕒🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"w":[8,5,3]}');
    validateJSON(parsed);
  });

  test('Should parse a document with a complex array', () => {
    const document = '🙌😉🤜🕗🕒🤝🌾🌿🌼🤝🕳🤝🦘🦞🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"w":[83,"678",null,"kl"]}');
    validateJSON(parsed);
  });

  test('Should parse a document with nested arrays', () => {
    const document = '🙌😉🤜🕗🤝🤜🕔🤝🕑🤛🤝🕒🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"w":[8,[5,2],3]}');
    validateJSON(parsed);
  });

  test('Should parse a document with a subobject', () => {
    const document = '🙌🤑👉🤩🕔👈✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"m":{"y":5}}');
    validateJSON(parsed);
  });

  test('Should parse a document with an empty subobject', () => {
    const document = '🙌🤑👉👈✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"m":{}}');
    validateJSON(parsed);
  });

  test('Should parse a document with an empty string key', () => {
    const document = '🙌🗝🕐✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"":1}');
    validateJSON(parsed);
  });

  test('Should parse a document with an empty string value', () => {
    const document = '🙌🤑🧵✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"m":""}');
    validateJSON(parsed);
  });

  test('Should parse a document with two identical subobjects', () => {
    const document = '🙌🤑👉🤩🕔👈🤑👉🤩🕔👈✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"m":{"y":5},"m":{"y":5}}');
    validateJSON(parsed);
  });

  test('Should parse a document with two different subobjects', () => {
    const document = '🙌🤑👉🤩🕔👈🤑👉😿🐋👈✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"m":{"y":5},"m":{"6":"w"}}');
    validateJSON(parsed);
  });

  test('Should parse a document with a four nibble unicode key', () => {
    const document = '🙌🌎🍏🍎🍎🥭🐜✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"Ĝ":"a"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a five nibble unicode key', () => {
    const document = '🙌🌎🍎🥝🍉🍓🥝🐜✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"🚏":"a"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a four nibble unicode value', () => {
    const document = '🙌😭🗺🖋🖌📕📍✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"r":"ǧ"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a five nibble unicode value', () => {
    const document = '🙌😭🗺🖌📋🖊📓📏✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"r":"🏆"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a four nibble unicode key and value', () => {
    const document = '🙌🌎🍏🍎🍎🥭🗺🖋🖌📕📍✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"Ĝ":"ǧ"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a five nibble unicode key and value', () => {
    const document = '🙌🌎🍎🥝🍉🍓🥝🗺🖌📋🖊📓📏✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"🚏":"🏆"}');
    validateJSON(parsed);
  });

  test('Should parse a document with newlines and whitespace', () => {
    const document = '🙌🌎 🍎🥝\n🍉🍓🥝🗺🖌 📋🖊📓📏✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"🚏":"🏆"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a mixed letter and unicode key', () => {
    const document = '🙌😂🌎🍏🍎🍎🥭🤩🐜✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"jĜy":"a"}');
    validateJSON(parsed);
  });

  test('Should parse a document with a mixed letter and unicode value', () => {
    const document = '🙌😭🐖🗺🖋🖌📕📍🦋✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"r":"iǧu"}');
    validateJSON(parsed);
  });

  test('Should parse a document that is only an empty array', () => {
    const document = '🙌🤜🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('[]');
  });

  test('Should parse a document with an empty array', () => {
    const document = '🙌😠🤜🤛🥺🤜🤜🤛🤝🤜🤛🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"a":[],"b":[[],[]]}');
  });

  test('Should parse a document that is only a string', () => {
    const document = '🙌👡🦔🐖✋';
    const parsed = parse(document);
    expect(parsed).toBe('"Hi"');
  });

  test('Should parse a document that is only an empty string', () => {
    const document = '🙌🧵✋';
    const parsed = parse(document);
    expect(parsed).toBe('""');
  });

  test('Should parse a document that is only a number', () => {
    const document = '🙌⏰🕓🕑✋';
    const parsed = parse(document);
    expect(parsed).toBe('-42');
  });

  test('Should parse a document with a positive exponent', () => {
    const document = '🙌😠🕐🚀🕑🕐✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"a":1e+21}');
    validateJSON(parsed);
  });

  test('Should parse a document with a negative exponent', () => {
    const document = '🙌😠🕐⛳️🕔🚀⏰🕖✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"a":1.5e-7}');
    validateJSON(parsed);
  });

  test('Should escape quotes, backslashes and control characters', () => {
    const document = '🙌🌎🍐🍐🗺🖍🖍🗺📐📓🗺📎🗺🖋✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"\\"":"\\"\\\\\\n\\u0000"}');
    validateJSON(parsed);
  });

  test('Should parse a document with variation selectors', () => {
    const document = '🙌😠🕳\ufe0f🥺🕐⛳\ufe0f🕐✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"a":null,"b":1.1}');
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
    ['a code point that is too large', '🙌😠🗺🖌🖋🖋🖋🖋🖋🖋✋', /Unexpected "🖋"/],
    ['a leading zero', '🙌😠🕛🕐✋', /Unexpected "🕐"/],
    ['a decimal without digits', '🙌😠🕐⛳️✋', /Unexpected "✋"/],
    ['an unclosed array', '🙌😠🤜🕐✋', /Unexpected "✋"/],
    ['a trailing array delimiter', '🙌😠🤜🕐🤝🤛✋', /Unexpected "🤛"/],
    ['an unclosed object', '🙌😠👉🥺🕐✋', /Unexpected "✋"/],
  ])('Should throw on %s', (_, document, message) => {
    expect(() => parse(document)).toThrow(SyntaxError);
    expect(() => parse(document)).toThrow(message);
  });
});
