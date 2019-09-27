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
    expect(lexed).toHaveLength(4);
    expect(lexed[1].text).toBe('😃🤤');
    expect(lexed[2].text).toBe('🐬🦓');
  });

  test('Should lex a document with a numeric key', () => {
    const lexed = lex('🙌🐱😻🐜✋');
    expect(lexed).toHaveLength(4);
    expect(lexed[2].text).toBe('🐜');
  });

  test('Should lex a document with multiple properties', () => {
    const lexed = lex('🙌🥳🌻🦘😻❤️✋');
    expect(lexed).toHaveLength(6);
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
    expect(parsed).toHaveLength(2);
    expect(parsed[0].value).toBe('🙌');
    expect(parsed[1].value).toBe('✋');
  });

  test('Should parse a document with one property', () => {
    const parsed = parse('🙌😃🐬✋');
    expect(parsed).toHaveLength(3);
    expect(parsed[0].value).toBe('🙌');
    expect(parsed[1][0][0][0].value).toBe('😃');
    expect(parsed[1][0][0][1].value).toBe('🐬');
    expect(parsed[2].value).toBe('✋');
  });

  test('Should parse a document with two properties', () => {
    const parsed = parse('🙌🥳🌻🤤🕑✋');
    const properties = parsed[1][0][0];
    expect(properties).toHaveLength(2);
  });
});
