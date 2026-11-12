import { parse, stringify } from '../src/index';
import * as fs from 'fs';

const readJson = (filePath: string): unknown => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const readEmojion = (filePath: string) => {
  return fs.readFileSync(filePath, 'utf8').trim();
};

describe('Library', () => {
  test.each(['1', '2', '3'])('should round-trip doc%s (JSON)', (name) => {
    const value = readJson(`./test/docs/${name}.json`);
    const emojion = stringify(value);
    expect(parse(emojion)).toEqual(value);
  });

  test('should round-trip docA (Emojion)', () => {
    const emojion = readEmojion('./test/docs/A.🙌');
    const value = parse(emojion);
    expect(stringify(value)).toBe(emojion);
  });

  test.each([
    '{"a":"x\\"y"}',
    '{"a":"line\\nbreak\\ttab\\\\"}',
    '{"\\u0000":"\\ud800"}',
    '{"__proto__":1}',
    '{"a":1e+21,"b":1e-7,"c":-1.5e-300,"d":0,"e":-0.5}',
    '"str"',
    '""',
    '42',
    '[]',
    '{"a":[],"b":[[],[[]]]}',
    '{"🙂":"😀"}',
  ])('should round-trip %s', (json) => {
    const value = JSON.parse(json);
    const parsed = parse(stringify(value));
    expect(parsed).toEqual(value);
    expect(JSON.stringify(parsed)).toBe(json);
  });

  test('should round-trip -0', () => {
    // JSON.stringify() writes -0 as 0, and so does stringify().
    expect(Object.is(parse(stringify(-0)), 0)).toBe(true);
    expect(Object.is(parse('🙌⏰🕛✋'), -0)).toBe(true);
  });

  test('should round-trip random documents', () => {
    let seed = 1;
    const random = () => {
      seed = (seed * 48271) % 2147483647;
      return seed / 2147483647;
    };
    const text = () =>
      Array.from({ length: Math.floor(random() * 6) }, () =>
        String.fromCodePoint(
          random() < 0.5
            ? 32 + Math.floor(random() * 95)
            : Math.floor(random() * 0x110000)
        )
      ).join('');
    const value = (depth: number): unknown => {
      const pick = Math.floor(random() * (depth > 3 ? 4 : 6));
      if (pick === 0) return text();
      if (pick === 1)
        return (random() - 0.5) * 10 ** Math.floor(random() * 60 - 30);
      if (pick === 2) return random() < 0.5;
      if (pick === 3) return null;
      if (pick === 4) {
        return Array.from({ length: Math.floor(random() * 4) }, () =>
          value(depth + 1)
        );
      }
      return Object.fromEntries(
        Array.from({ length: Math.floor(random() * 4) }, () => [
          text(),
          value(depth + 1),
        ])
      );
    };
    for (let i = 0; i < 2000; i++) {
      const v = value(0);
      const parsed = parse(stringify(v));
      expect(parsed).toEqual(v);
      expect(JSON.stringify(parsed)).toBe(JSON.stringify(v));
    }
  });

  const nestedArrays = (depth: number) => {
    let value: unknown = [];
    for (let i = 1; i < depth; i++) value = [value];
    return value;
  };
  const nestedObjects = (depth: number) => {
    let value: unknown = {};
    for (let i = 0; i < depth; i++) value = { a: value };
    return value;
  };

  test('should round-trip nesting up to the limit', () => {
    // A top-level object is not counted, as it has no 👉👈.
    expect(parse(stringify(nestedArrays(512)))).toEqual(nestedArrays(512));
    expect(parse(stringify(nestedObjects(512)))).toEqual(nestedObjects(512));
  });

  test('should refuse to stringify nesting past the limit', () => {
    expect(() => stringify(nestedArrays(513))).toThrow(RangeError);
    expect(() => stringify(nestedArrays(513))).toThrow(
      /nesting exceeds 512 levels/
    );
    expect(() => stringify(nestedObjects(513))).toThrow(RangeError);
    expect(() => stringify(nestedArrays(10000))).toThrow(RangeError);
    expect(parse(stringify({ a: 1 }))).toEqual({ a: 1 });
  });
});
