import { lex, parse } from '../src/index';

describe('Lexer', () => {
  test('Should lex an empty document', () => {
    const lexed = lex('🙌✋');
    expect(lexed).toHaveLength(2);
    expect(lexed[0].text).toBe('🙌');
    expect(lexed[1].text).toBe('✋');
  });

  test('Should lex a document with one property', () => {
    const lexed = lex('🙌😃🕔✋');
    expect(lexed).toHaveLength(4);
    expect(lexed[0].text).toBe('🙌');
    expect(lexed[1].text).toBe('😃');
    expect(lexed[2].text).toBe('🕔');
    expect(lexed[3].text).toBe('✋');
  });

  test('Should lex a document with a multi-character property', () => {
    const lexed = lex('🙌😃🤤🐬🦓✋');
    expect(lexed).toHaveLength(6);
    expect(lexed[1].text).toBe('😃');
    expect(lexed[3].text).toBe('🐬');
  });

  test('Should lex a document with a numeric key', () => {
    const lexed = lex('🙌🐱😻🐜✋');
    expect(lexed).toHaveLength(5);
    expect(lexed[3].text).toBe('🐜');
  });

  test('Should error on an invalid character', () => {
    expect(() => {
      lex('💩');
    }).toThrow();
  });
});

describe('Parser', () => {
  test('Should parse an empty document', () => {
    const parsed = parse('🙌✋');
    expect(parsed).toEqual('{}');
  });

  test('Should parse a document with one property', () => {
    const parsed = parse('🙌😃🐬✋');
    expect(parsed).toBe('{"😃":"🐬"}');
  });

  test('Should parse a document with two properties', () => {
    const parsed = parse('🙌🥳🌻🤤🕑✋');
    expect(parsed).toBe('{"🥳":"🌻","🤤":🕑}');
  });

  test('Should parse a document with a subobject', () => {
    const parsed = parse('🙌🤑👉🤩🕔👈✋');
    expect(parsed).toBe('{"🤑":{"🤩":🕔}}');
  });

  test('Should parse a document with two identical subobjects', () => {
    const parsed = parse('🙌🤑👉🤩🕔👈🤑👉🤩🕔👈✋');
    expect(parsed).toBe('{"🤑":{"🤩":🕔},"🤑":{"🤩":🕔}}');
  });

  test('Should parse a document with two different subobjects', () => {
    const parsed = parse('🙌🤑👉🤩🕔👈🤑👉😿🐋👈✋');
    expect(parsed).toBe('{"🤑":{"🤩":🕔},"🤑":{"😿":"🐋"}}');
  });
});
