import { parse } from '../src/index';
import { load } from './util';

const invalidDoc = load('-1.🙌');
const emptyDoc = load('0.🙌');
const onePropertyDoc = load('1.🙌');
const multiCharacterPropertyDoc = load('2.🙌');
const numericKeyDoc = load('3.🙌');
const twoPropertyDoc = load('4.🙌');

test('Should lex an empty document', () => {
  const parsed = parse(emptyDoc);
  expect(parsed).toHaveLength(2);
});

test('Should lex a document with one property', () => {
  const parsed = parse(onePropertyDoc);
  expect(parsed).toHaveLength(4);
});

test('Should lex a document with a multi-character property', () => {
  const parsed = parse(multiCharacterPropertyDoc);
  expect(parsed).toHaveLength(4);
});

test('Should lex a document with a numeric key', () => {
  const parsed = parse(numericKeyDoc);
  expect(parsed).toHaveLength(4);
});

test('Should lex a document with multiple properties', () => {
  const parsed = parse(twoPropertyDoc);
  expect(parsed).toHaveLength(6);
});

test('Should error on an invalid character', () => {
  expect(() => {
    parse(invalidDoc);
  }).toThrow();
});
