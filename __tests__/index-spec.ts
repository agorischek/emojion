import { lex, parse } from '../src/index';

test('Should lex an empty document', () => {
  const lexed = lex('🙌✋');
  expect(lexed).toHaveLength(2);
});

test('Should lex a document with one property', () => {
  const lexed = lex('🙌😃🐬✋');
  expect(lexed).toHaveLength(4);
});

test('Should lex a document with a multi-character property', () => {
  const lexed = lex('🙌😃🤤🐬🦓✋');
  expect(lexed).toHaveLength(4);
});

test('Should lex a document with a numeric key', () => {
  const lexed = lex('🙌🐱😻🐜✋');
  expect(lexed).toHaveLength(4);
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

test('Should parse an empty document', () => {
  const parsed = parse('🙌✋');
  expect(parsed).toHaveLength(2);
  expect(parsed[0].value).toBe('🙌');
  expect(parsed[1].value).toBe('✋');
});
