import { generate } from '../src/index';

describe('Generator', () => {
  test('Should return a true boolean', () => {
    const generated = generate('true');
    expect(generated).toBe('🙌💚✋');
  });

  test('Should return a false boolean', () => {
    const generated = generate('false');
    expect(generated).toBe('🙌💔✋');
  });

  test('Should return a null', () => {
    const generated = generate('null');
    expect(generated).toBe('🙌🕳✋');
  });

  test('Should return an empty document', () => {
    const generated = generate('{}');
    expect(generated).toBe('🙌✋');
  });

  test('Should return a simple object', () => {
    const generated = generate('{"a":"a"}');
    expect(generated).toBe('🙌😠🐜✋');
  });

  test('Should return an empty key', () => {
    const generated = generate('{"":1}');
    expect(generated).toBe('🙌🗝🕐✋');
  });

  test('Should return an empty value string', () => {
    const generated = generate('{"l":""}');
    expect(generated).toBe('🙌🥰🧵✋');
  });

  test('Should return both an empty key and value string', () => {
    const generated = generate('{"":""}');
    expect(generated).toBe('🙌🗝🧵✋');
  });

  test('Should return a key with unicode', () => {
    const generated = generate('{"a🎱":"a"}');
    expect(generated).toBe('🙌😠🌎🍎🥝🍊🍑🍎🐜✋');
  });

  test('Should return a value with unicode', () => {
    const generated = generate('{"a":"a🏸"}');
    expect(generated).toBe('🙌😠🐜🗺🖌📋🖊📋📌✋');
  });

  test('Should return an object with a numeric value', () => {
    const generated = generate('{"a":1}');
    expect(generated).toBe('🙌😠🕐✋');
  });

  test('Should return an object with a negative numeric value', () => {
    const generated = generate('{"a":-1}');
    expect(generated).toBe('🙌😠⏰🕐✋');
  });

  test('Should return an object with a floating point numeric value', () => {
    const generated = generate('{"a":1.1}');
    expect(generated).toBe('🙌😠🕐⛳️🕐✋');
  });

  test('Should return an object with a negative floating point numeric value', () => {
    const generated = generate('{"a":-1.1}');
    expect(generated).toBe('🙌😠⏰🕐⛳️🕐✋');
  });

  test('Should return a subobject with multiple properties', () => {
    const generated = generate('{"a": {"b": true, "c": false}}');
    expect(generated).toBe('🙌😠👉🥺💚😖💔👈✋');
  });

  test('Should return an empty array', () => {
    const generated = generate('[]');
    expect(generated).toBe('🙌🤜🤛✋');
  });

  test('Should return a single-value array', () => {
    const generated = generate('[2]');
    expect(generated).toBe('🙌🤜🕑🤛✋');
  });

  test('Should return a two-value array', () => {
    const generated = generate('[2, 1]');
    expect(generated).toBe('🙌🤜🕑🤝🕐🤛✋');
  });

  test('Should return a nested array', () => {
    const generated = generate('[2, [1,2]]');
    expect(generated).toBe('🙌🤜🕑🤝🤜🕐🤝🕑🤛🤛✋');
  });

  test('Should return a nested object', () => {
    const generated = generate('{"a":{"b":2}}');
    expect(generated).toBe('🙌😠👉🥺🕑👈✋');
  });

  test('Should return an object with multiple properties', () => {
    const generated = generate('{"g":4,"f":1}');
    expect(generated).toBe('🙌🤪🕓🙁🕐✋');
  });

  test('Should encode capital letters', () => {
    const generated = generate('{"L":"X"}');
    expect(generated).toBe('🙌👠🥰👡🐂✋');
  });

  test('Should return a root string', () => {
    const generated = generate('"Hi"');
    expect(generated).toBe('🙌👡🦔🐖✋');
  });

  test('Should return a root empty string', () => {
    const generated = generate('""');
    expect(generated).toBe('🙌🧵✋');
  });

  test('Should return a root number', () => {
    const generated = generate('-42');
    expect(generated).toBe('🙌⏰🕓🕑✋');
  });

  test('Should return a positive exponent', () => {
    const generated = generate('{"a":1e21}');
    expect(generated).toBe('🙌😠🕐🚀🕑🕐✋');
  });

  test('Should return a negative exponent', () => {
    const generated = generate('{"a":1.5e-7}');
    expect(generated).toBe('🙌😠🕐⛳️🕔🚀⏰🕖✋');
  });

  test('Should encode JSON escapes as unicode', () => {
    const generated = generate('{"a":"\\"\\n"}');
    expect(generated).toBe('🙌😠🗺🖍🖍🗺📎✋');
  });
});
