import { invert, merge } from 'lodash';

function extractValues(dict: object) {
  const values = Object.values(dict);
  const concatenation = values.reduce((acc, val) => acc.concat(val));
  return concatenation;
}

function makeRegexp(characters: string) {
  const regexp = new RegExp(`[ ${characters}]`, 'u');
  return regexp;
}

export const collapse = (dict: object) => {
  const concatenation = extractValues(dict);
  const regexp = makeRegexp(concatenation);
  return regexp;
};

export const collapseMultiple = (dicts: object[]) => {
  const valuesArray = dicts.map(x => extractValues(x));
  const concatenation = valuesArray.reduce((acc, val) => acc.concat(val));
  const regexp = makeRegexp(concatenation);
  return regexp;
};

export const flip = (dict: object) => {
  const flipped = invert(dict);
  return flipped;
};

export const flipMultiple = (dicts: object[]) => {
  const flippedArray = dicts.map(x => flip(x));
  const merged = flippedArray.reduce((acc, val) => merge(acc, val));
  return merged;
};
