import { parse, stringify } from '../src/index';

// What JSON.stringify() keeps of a value, as a value.
const viaJson = (value: unknown) => JSON.parse(JSON.stringify(value));

describe('Stringify', () => {
  test('Should return a true boolean', () => {
    const emojion = stringify(true);
    expect(emojion).toBe('🙌💚✋');
  });

  test('Should return a false boolean', () => {
    const emojion = stringify(false);
    expect(emojion).toBe('🙌💔✋');
  });

  test('Should return a null', () => {
    const emojion = stringify(null);
    expect(emojion).toBe('🙌🕳✋');
  });

  test('Should return an empty document', () => {
    const emojion = stringify({});
    expect(emojion).toBe('🙌✋');
  });

  test('Should return a simple object', () => {
    const emojion = stringify({ a: 'a' });
    expect(emojion).toBe('🙌😠🐜✋');
  });

  test('Should return an empty key', () => {
    const emojion = stringify({ '': 1 });
    expect(emojion).toBe('🙌🗝🕐✋');
  });

  test('Should return an empty value string', () => {
    const emojion = stringify({ l: '' });
    expect(emojion).toBe('🙌🥰🧵✋');
  });

  test('Should return both an empty key and value string', () => {
    const emojion = stringify({ '': '' });
    expect(emojion).toBe('🙌🗝🧵✋');
  });

  test('Should return a key with unicode', () => {
    const emojion = stringify({ 'a🎱': 'a' });
    expect(emojion).toBe('🙌😠🌎🍎🥝🍊🍑🍎🐜✋');
  });

  test('Should return a value with unicode', () => {
    const emojion = stringify({ a: 'a🏸' });
    expect(emojion).toBe('🙌😠🐜🗺🖌📋🖊📋📌✋');
  });

  test('Should return an object with a numeric value', () => {
    const emojion = stringify({ a: 1 });
    expect(emojion).toBe('🙌😠🕐✋');
  });

  test('Should return an object with a negative numeric value', () => {
    const emojion = stringify({ a: -1 });
    expect(emojion).toBe('🙌😠⏰🕐✋');
  });

  test('Should return an object with a floating point numeric value', () => {
    const emojion = stringify({ a: 1.1 });
    expect(emojion).toBe('🙌😠🕐⛳️🕐✋');
  });

  test('Should return an object with a negative floating point numeric value', () => {
    const emojion = stringify({ a: -1.1 });
    expect(emojion).toBe('🙌😠⏰🕐⛳️🕐✋');
  });

  test('Should return a subobject with multiple properties', () => {
    const emojion = stringify({ a: { b: true, c: false } });
    expect(emojion).toBe('🙌😠👉🥺💚😖💔👈✋');
  });

  test('Should return an empty array', () => {
    const emojion = stringify([]);
    expect(emojion).toBe('🙌🤜🤛✋');
  });

  test('Should return a single-value array', () => {
    const emojion = stringify([2]);
    expect(emojion).toBe('🙌🤜🕑🤛✋');
  });

  test('Should return a two-value array', () => {
    const emojion = stringify([2, 1]);
    expect(emojion).toBe('🙌🤜🕑🤝🕐🤛✋');
  });

  test('Should return a nested array', () => {
    const emojion = stringify([2, [1, 2]]);
    expect(emojion).toBe('🙌🤜🕑🤝🤜🕐🤝🕑🤛🤛✋');
  });

  test('Should return a nested object', () => {
    const emojion = stringify({ a: { b: 2 } });
    expect(emojion).toBe('🙌😠👉🥺🕑👈✋');
  });

  test('Should return an object with multiple properties', () => {
    const emojion = stringify({ g: 4, f: 1 });
    expect(emojion).toBe('🙌🤪🕓🙁🕐✋');
  });

  test('Should encode capital letters', () => {
    const emojion = stringify({ L: 'X' });
    expect(emojion).toBe('🙌👠🥰👡🐂✋');
  });

  test('Should return a root string', () => {
    const emojion = stringify('Hi');
    expect(emojion).toBe('🙌👡🦔🐖✋');
  });

  test('Should return a root empty string', () => {
    const emojion = stringify('');
    expect(emojion).toBe('🙌🧵✋');
  });

  test('Should return a root number', () => {
    const emojion = stringify(-42);
    expect(emojion).toBe('🙌⏰🕓🕑✋');
  });

  test('Should return a positive exponent', () => {
    const emojion = stringify({ a: 1e21 });
    expect(emojion).toBe('🙌😠🕐🚀🕑🕐✋');
  });

  test('Should return a negative exponent', () => {
    const emojion = stringify({ a: 1.5e-7 });
    expect(emojion).toBe('🙌😠🕐⛳️🕔🚀⏰🕖✋');
  });

  test('Should encode quotes and newlines as unicode', () => {
    const emojion = stringify({ a: '"\n' });
    expect(emojion).toBe('🙌😠🗺🖍🖍🗺📎✋');
  });

  test('Should write the same document for -0 as for 0', () => {
    expect(stringify(-0)).toBe('🙌🕛✋');
    expect(stringify([-0, { a: -0 }])).toBe(stringify([0, { a: 0 }]));
  });

  test('Should write NaN and Infinity as null', () => {
    expect(stringify(NaN)).toBe('🙌🕳✋');
    expect(parse(stringify([NaN, Infinity, -Infinity]))).toEqual([
      null,
      null,
      null,
    ]);
    expect(parse(stringify({ a: Infinity }))).toEqual({ a: null });
  });

  test('Should skip undefined, functions and symbols in objects', () => {
    const value = { a: undefined, b: () => 1, c: Symbol('c'), d: 1 };
    expect(stringify(value)).toBe(stringify({ d: 1 }));
    expect(parse(stringify(value))).toEqual(viaJson(value));
  });

  test('Should write undefined, functions and symbols in arrays as null', () => {
    const value = [undefined, () => 1, Symbol('c'), 1];
    expect(parse(stringify(value))).toEqual([null, null, null, 1]);
    expect(parse(stringify(value))).toEqual(viaJson(value));
  });

  test('Should write holes in arrays as null', () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(parse(stringify([1, , 3]))).toEqual([1, null, 3]);
  });

  test('Should skip symbol keys and non-enumerable properties', () => {
    const value = { a: 1, [Symbol('b')]: 2 };
    Object.defineProperty(value, 'c', { value: 3, enumerable: false });
    expect(parse(stringify(value))).toEqual({ a: 1 });
  });

  test.each([
    ['undefined', undefined],
    ['a function', () => 1],
    ['a symbol', Symbol('a')],
    ['toJSON() returning undefined', { toJSON: () => undefined }],
  ])('Should throw a TypeError for a top-level %s', (_, value) => {
    expect(JSON.stringify(value)).toBeUndefined();
    expect(() => stringify(value)).toThrow(TypeError);
    expect(() => stringify(value)).toThrow(/Emojion cannot hold/);
  });

  test('Should call toJSON()', () => {
    const date = new Date(Date.UTC(2019, 0, 1));
    expect(parse(stringify(date))).toBe('2019-01-01T00:00:00.000Z');
    expect(parse(stringify({ date }))).toEqual({
      date: '2019-01-01T00:00:00.000Z',
    });
  });

  test('Should pass toJSON() its key, as JSON.stringify() does', () => {
    const keys: unknown[] = [];
    const item = {
      toJSON(key: unknown) {
        keys.push(key);
        return key;
      },
    };
    const value = { a: item, b: [item, item], '': item };
    const expected = viaJson(value);
    const jsonKeys = keys.splice(0);
    expect(parse(stringify(item))).toBe('');
    expect(keys.splice(0)).toEqual(['']);
    expect(parse(stringify(value))).toEqual(expected);
    expect(keys).toEqual(jsonKeys);
    expect(keys).toEqual(['a', '0', '1', '']);
  });

  test('Should use what toJSON() returns without calling it again', () => {
    const inner = { toJSON: () => 'inner' };
    const value = { toJSON: () => ({ a: inner, b: undefined }) };
    expect(stringify(value)).toBe(stringify({ a: 'inner' }));
    const nested = { toJSON: () => ({ toJSON: () => 'too far' }) };
    expect(parse(stringify(nested))).toEqual(viaJson(nested));
    expect(parse(stringify([{ toJSON: () => undefined }]))).toEqual([null]);
    expect(parse(stringify({ a: { toJSON: () => undefined } }))).toEqual({});
  });

  test('Should unwrap boxed primitives', () => {
    const value = {
      n: new Number(3),
      s: new String('x'),
      t: new Boolean(true),
      f: new Boolean(false),
    };
    expect(parse(stringify(value))).toEqual({
      n: 3,
      s: 'x',
      t: true,
      f: false,
    });
    expect(stringify(new String('Hi'))).toBe(stringify('Hi'));
    expect(stringify(new Boolean(false))).toBe(stringify(false));
    expect(stringify(new Number(-0))).toBe(stringify(0));
    expect(stringify(new Number(NaN))).toBe(stringify(null));
  });

  test('Should unwrap boxed numbers and strings with valueOf() and toString()', () => {
    const number = Object.assign(new Number(1), { valueOf: () => 2 });
    const string = Object.assign(new String('a'), { toString: () => 'b' });
    expect(parse(stringify([number, string]))).toEqual(
      viaJson([number, string])
    );
    expect(parse(stringify([number, string]))).toEqual([2, 'b']);
  });

  test('Should not mistake look-alikes for boxed primitives', () => {
    const fake = Object.create(Number.prototype);
    fake.a = 1;
    const tagged = { [Symbol.toStringTag]: 'String', a: 1 };
    expect(parse(stringify([fake, tagged]))).toEqual(viaJson([fake, tagged]));
  });

  test('Should throw a TypeError on BigInt', () => {
    expect(() => stringify(BigInt(1))).toThrow(TypeError);
    expect(() => stringify({ a: [BigInt(1)] })).toThrow(/serialize a BigInt/);
    expect(() => stringify(Object(BigInt(1)))).toThrow(TypeError);
  });

  test('Should call toJSON() on BigInt', () => {
    const proto = BigInt.prototype as unknown as Record<string, unknown>;
    proto.toJSON = function (this: bigint) {
      return this.toString();
    };
    try {
      expect(parse(stringify({ a: BigInt(12) }))).toEqual({ a: '12' });
      expect(parse(stringify(BigInt(12)))).toBe('12');
    } finally {
      delete proto.toJSON;
    }
  });

  test('Should throw a TypeError on circular structures', () => {
    const object: Record<string, unknown> = { a: 1 };
    object.self = object;
    const array: unknown[] = [];
    array.push({ array });
    expect(() => stringify(object)).toThrow(TypeError);
    expect(() => stringify(object)).toThrow(/circular structure/);
    expect(() => stringify(array)).toThrow(/circular structure/);
    expect(() => stringify({ a: { b: object } })).toThrow(/circular/);
  });

  test('Should allow the same object more than once without a cycle', () => {
    const shared = { a: 1 };
    const value = { b: shared, c: [shared, shared] };
    expect(parse(stringify(value))).toEqual(viaJson(value));
  });

  test('Should recover after an error', () => {
    const object: Record<string, unknown> = {};
    object.self = object;
    expect(() => stringify([object])).toThrow(TypeError);
    const value = { a: [{ b: 1 }] };
    expect(parse(stringify(value))).toEqual(value);
    expect(() =>
      stringify({
        a: {
          toJSON() {
            throw new Error('boom');
          },
        },
      })
    ).toThrow('boom');
    expect(parse(stringify(value))).toEqual(value);
  });

  test('Should allow toJSON() to call stringify()', () => {
    const value = { a: { toJSON: () => stringify({ b: 1 }) }, c: [2] };
    expect(parse(stringify(value))).toEqual({ a: stringify({ b: 1 }), c: [2] });
  });

  test('Should write own enumerable properties of any object', () => {
    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}
      get length() {
        return Math.hypot(this.x, this.y);
      }
    }
    const value = {
      point: new Point(3, 4),
      map: new Map([[1, 2]]),
      bare: Object.assign(Object.create(null), { a: 1 }),
      error: new Error('x'),
      regexp: /x/,
    };
    expect(parse(stringify(value))).toEqual(viaJson(value));
    expect(parse(stringify(value))).toEqual({
      point: { x: 3, y: 4 },
      map: {},
      bare: { a: 1 },
      error: {},
      regexp: {},
    });
  });

  test('Should write a __proto__ own property as a key', () => {
    const value = JSON.parse('{"__proto__":{"a":1},"b":2}');
    const parsed = parse(stringify(value)) as object;
    expect(Object.keys(parsed)).toEqual(['__proto__', 'b']);
    expect(parsed).toEqual(value);
  });

  test('Should write a top-level object from toJSON() without 👉👈', () => {
    expect(stringify({ toJSON: () => ({ a: 'a' }) })).toBe('🙌😠🐜✋');
    expect(stringify(new Number(2))).toBe('🙌🕑✋');
  });
});
