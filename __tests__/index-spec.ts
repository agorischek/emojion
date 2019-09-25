import { lex } from '../src/index';
import { load } from './util';

const invalidDoc = load('-1.🙌');
const emptyDoc = load('0.🙌');
const onePropertyDoc = load('1.🙌');
const multiCharacterPropertyDoc = load('2.🙌');
const numericKeyDoc = load('3.🙌');
const twoPropertyDoc = load('4.🙌');

test('Should lex an empty document', () => {
  const lexed = lex(emptyDoc);
  expect(lexed).toHaveLength(2);
});

test('Should lex a document with one property', () => {
  const lexed = lex(onePropertyDoc);
  expect(lexed).toHaveLength(4);
});

test('Should lex a document with a multi-character property', () => {
  const lexed = lex(multiCharacterPropertyDoc);
  expect(lexed).toHaveLength(4);
});

test('Should lex a document with a numeric key', () => {
  const lexed = lex(numericKeyDoc);
  expect(lexed).toHaveLength(4);
});

test('Should lex a document with multiple properties', () => {
  const lexed = lex(twoPropertyDoc);
  expect(lexed).toHaveLength(6);
});

test('Should error on an invalid character', () => {
  expect(() => {
    lex(invalidDoc);
  }).toThrow();
});
