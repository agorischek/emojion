import * as fs from 'fs';

const root = './__tests__/corpus/';

export const load = function(path: string) {
  return fs.readFileSync(root + path, 'utf8').trim();
};
