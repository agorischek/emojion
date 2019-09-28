import { lex, parse } from '../src/index';
import { validateGrammar } from '../src/parser';

const validateJSON = (document: string) =>
  expect(JSON.parse(document)).toBeTruthy();

describe('Lexer', () => {
  test('Should lex an empty document', () => {
    const document = '🙌✋';
    const lexed = lex(document);
    expect(lexed).toHaveLength(2);
    expect(lexed[0].text).toBe('🙌');
    expect(lexed[1].text).toBe('✋');
  });

  test('Should lex a document with one property', () => {
    const document = '🙌😃🕔✋';
    const lexed = lex(document);
    expect(lexed).toHaveLength(4);
    expect(lexed[0].text).toBe('🙌');
    expect(lexed[1].text).toBe('😃');
    expect(lexed[2].text).toBe('🕔');
    expect(lexed[3].text).toBe('✋');
  });

  test('Should lex a document with a multi-character property', () => {
    const document = '🙌😃🤤🐬🦓✋';
    const lexed = lex(document);
    expect(lexed).toHaveLength(6);
    expect(lexed[1].text).toBe('😃');
    expect(lexed[3].text).toBe('🐬');
  });

  test('Should lex a document with a numeric key', () => {
    const document = '🙌🐱😻🐜✋';
    const lexed = lex(document);
    expect(lexed).toHaveLength(5);
    expect(lexed[3].text).toBe('🐜');
  });

  test('Should error on an invalid character', () => {
    const document = '💩';
    expect(() => {
      lex(document);
    }).toThrow();
  });
});

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

  test.skip('Should parse a document with whitespace', () => {
    const document = '🙌😃  🐬✋ ';
    const parsed = parse(document);
    expect(parsed).toBe('{"h":"d"}');
    validateJSON(parsed);
    validateGrammar(document);
  });

  test('Should parse a document with a multicharacter string value', () => {
    const document = '🙌🤫🐜🐢🐌✋';
    const parsed = parse(document);
    expect(parsed).toBe('{"q":"ats"}');
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
});
