import { generate, parse } from '../src/index';
import * as fs from 'fs';

const readJson = (filePath: string) => {
  return JSON.stringify(JSON.parse(fs.readFileSync(filePath, 'utf8')));
};

const readEmojion = (filePath: string) => {
  return fs.readFileSync(filePath, 'utf8').trim();
};

describe('Library', () => {
  test('should round-trip doc1 (JSON)', () => {
    const json = readJson('./test/docs/1.json');
    const emojion = generate(json);
    const parsed = parse(emojion);
    expect(parsed).toEqual(json);
  });
  test('should round-trip doc2 (JSON)', () => {
    const json = readJson('./test/docs/2.json');
    const emojion = generate(json);
    const parsed = parse(emojion);
    expect(parsed).toEqual(json);
  });
  test('should round-trip doc3 (JSON)', () => {
    const json = readJson('./test/docs/3.json');
    const emojion = generate(json);
    const parsed = parse(emojion);
    expect(parsed).toEqual(json);
  });

  test('should round-trip docA (Emojion)', () => {
    const emojion = readEmojion('./test/docs/A.🙌');
    const json = parse(emojion);
    const generated = generate(json);
    expect(generated).toEqual(emojion);
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
    const emojion = generate(json);
    expect(parse(emojion)).toBe(json);
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
      const json = JSON.stringify(value(0));
      expect(parse(generate(json))).toBe(json);
    }
  });
});
