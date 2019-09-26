import * as fs from 'fs';

const root = './__tests__/corpus/';

export const load = (path: string) => {
  return fs.readFileSync(root + path, 'utf8').trim();
};

export const docs = {
  invalid: load('-1.🙌'),
  empty: load('0.🙌'),
  oneProperty: load('1.🙌'),
  multiCharacterProperty: load('2.🙌'),
  numericKey: load('3.🙌'),
  twoProperties: load('4.🙌'),
};
