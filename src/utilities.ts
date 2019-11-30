import { invert, merge } from 'lodash';

function concatValuesFromObject(dict: object) {
  const values = Object.values(dict);
  const concatenation = values.reduce((acc, val) => acc.concat(val));
  return concatenation;
}

export const makeRegexp = (characters: string) => {
  const regexp = new RegExp(`[ ${characters}]`, 'u');
  return regexp;
};

export const makeRegexpFromValuesInObject = (dict: object) => {
  const concatenation = concatValuesFromObject(dict);
  const regexp = makeRegexp(concatenation);
  return regexp;
};

export const makeRegexpFromValuesInMultipleObjects = (dicts: object[]) => {
  const valuesArray = dicts.map(x => concatValuesFromObject(x));
  const concatenation = valuesArray.reduce((acc, val) => acc.concat(val));
  const regexp = makeRegexp(concatenation);
  return regexp;
};

export const switchKeysAndValuesInObject = (dict: object) => {
  const flipped = invert(dict);
  return flipped;
};

export const switchKeysAndValuesInMultipleObjectsThenMerge = (
  dicts: object[]
) => {
  const flippedArray = dicts.map(x => switchKeysAndValuesInObject(x));
  const merged = flippedArray.reduce((acc, val) => merge(acc, val));
  return merged;
};

export const charFromCodePoint = (hexNibblesAsString: string) => {
  const hexNumberAsString: string = Number(
    '0x' + hexNibblesAsString
  ).toString();
  const codePoint: number = parseInt(hexNumberAsString, 10);
  const character: string = String.fromCodePoint(codePoint);
  return character;
};
