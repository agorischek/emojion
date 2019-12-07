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
    fs.writeFileSync('out.sdlfjk', emojion);
    expect(parsed).toEqual(json);
  });

  test('should round-trip docA (Emojion)', () => {
    const emojion = readEmojion('./test/docs/A.🙌');
    const json = parse(emojion);
    const generated = generate(json);
    expect(generated).toEqual(emojion);
  });
});
