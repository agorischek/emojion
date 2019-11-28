import { lex } from '../src/index';

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
