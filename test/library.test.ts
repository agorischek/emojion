import { generate, parse } from '../src/index';
import * as fs from 'fs';

const readJson = (filePath: string) => {
  return JSON.stringify(JSON.parse(fs.readFileSync(filePath, 'utf8')));
};

describe('Library', () => {
  test('should round-trip doc1', () => {
    const json = readJson('./test/docs/1.json');
    const emojion = generate(json);
    const parsed = parse(emojion);
    expect(parsed).toEqual(json);
  });
});
