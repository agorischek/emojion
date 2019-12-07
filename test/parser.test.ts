import { parse } from '../src/index';
import { validateGrammar } from '../src/parser';

const validateJSON = (document: string) =>
  expect(JSON.parse(document)).toBeTruthy();

describe('Parser', () => {
  test('Should parse an empty document', () => {
    const document = '🙌✋';
    const parsed = parse(document);
    expect(parsed).toEqual('{}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with one property', () => {
    const document = '🙌😃🐬✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"h":"d"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with two properties', () => {
    const document = '🙌🥳🌻🤤🕑✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"p":"0","d":2}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a floating point value', () => {
    const document = '🙌😭🕓🕖⛳️🕗🕐✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"r":47.81}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document that is only a boolean', () => {
    const document = '🙌💚✋';
    const parsed = parse(document);
    expect(parsed).toBe('true');
    validateGrammar(document);
  });

  test('Should parse a document that is only an array', () => {
    const document = '🙌🤜🐜🤝🐢🤝🐌🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('["a","t","s"]');
    validateGrammar(document);
  });

  test('Should parse a document with a multicharacter string value', () => {
    const document = '🙌🤫🐜🐢🐌✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"q":"ats"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a multicharacter string key', () => {
    const document = '🙌🤔🙃😭🐝✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"iur":"b"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a multicharacter string and numeral key', () => {
    const document = '🙌😵😿🦋✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"x6":"u"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a multicharacter numeric value', () => {
    const document = '🙌😖🕑🕒🕔✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"c":235}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with upper case letters', () => {
    const document = '🙌👠🥰👡🐂✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"L":"X"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a one-item array', () => {
    const document = '🙌😉🤜🕗🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"w":[8]}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a two-item array', () => {
    const document = '🙌😉🤜🕗🤝🕔🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"w":[8,5]}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a three-item array', () => {
    const document = '🙌😉🤜🕗🤝🕔🤝🕒🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"w":[8,5,3]}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a complex array', () => {
    const document = '🙌😉🤜🕗🕒🤝🌾🌿🌼🤝🕳🤝🦘🦞🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"w":[83,"678",null,"kl"]}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with nested arrays', () => {
    const document = '🙌😉🤜🕗🤝🤜🕔🤝🕑🤛🤝🕒🤛✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"w":[8,[5,2],3]}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a subobject', () => {
    const document = '🙌🤑👉🤩🕔👈✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"m":{"y":5}}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with an empty subobject', () => {
    const document = '🙌🤑👉👈✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"m":{}}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with an empty string key', () => {
    const document = '🙌🗝🕐✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"":1}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with an empty string value', () => {
    const document = '🙌🤑🧵✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"m":""}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with two identical subobjects', () => {
    const document = '🙌🤑👉🤩🕔👈🤑👉🤩🕔👈✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"m":{"y":5},"m":{"y":5}}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with two different subobjects', () => {
    const document = '🙌🤑👉🤩🕔👈🤑👉😿🐋👈✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"m":{"y":5},"m":{"6":"w"}}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a four nibble unicode key', () => {
    const document = '🙌🌎🍏🍎🍎🥭🐜✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"Ĝ":"a"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a five nibble unicode key', () => {
    const document = '🙌🌎🍎🥝🍉🍓🥝🐜✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"🚏":"a"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a four nibble unicode value', () => {
    const document = '🙌😭🗺🖋🖌📕📍✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"r":"ǧ"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a five nibble unicode value', () => {
    const document = '🙌😭🗺🖌📋🖊📓📏✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"r":"🏆"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a four nibble unicode key and value', () => {
    const document = '🙌🌎🍏🍎🍎🥭🗺🖋🖌📕📍✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"Ĝ":"ǧ"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a five nibble unicode key and value', () => {
    const document = '🙌🌎🍎🥝🍉🍓🥝🗺🖌📋🖊📓📏✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"🚏":"🏆"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a mixed letter and unicode key', () => {
    const document = '🙌😂🌎🍏🍎🍎🥭🤩🐜✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"jĜy":"a"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a mixed letter and unicode value', () => {
    const document = '🙌😭🐖🗺🖋🖌📕📍🦋✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"r":"iǧu"}');
    validateJSON(parsed);
    validateGrammar(document);
  });
});
