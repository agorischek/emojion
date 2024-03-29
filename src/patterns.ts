import { characters } from './characters';
import {
  makeRegexpFromValuesInObject,
  switchKeysAndValuesInMultipleObjectsThenMerge,
} from './utilities';
import { forEach, merge } from 'lodash';

export const patterns = {
  arrayClose: characters.document.arrayClose,
  arrayDelimit: characters.document.arrayDelimit,
  arrayOpen: characters.document.arrayOpen,
  documentEnd: characters.document.end,
  documentIndent: characters.document.indent,
  documentOutdent: characters.document.outdent,
  documentStart: characters.document.start,
  keyEmptyString: characters.keys.other.empty,
  keyLetter: makeRegexpFromValuesInObject(characters.keys.letters),
  keyModifierUpper: characters.keys.modifiers.upperCase,
  keyModifierUnicode: characters.keys.modifiers.unicode,
  keyUnicodeNibble: makeRegexpFromValuesInObject(characters.keys.unicode),
  keyNumeral: makeRegexpFromValuesInObject(characters.keys.numerals),
  valueBool: makeRegexpFromValuesInObject(characters.values.booleans),
  valueLetter: makeRegexpFromValuesInObject(characters.values.letters),
  valueDecimal: characters.values.numbers['.'],
  valueEmptyString: characters.values.other.emptyString,
  valueModifierUpper: characters.values.modifiers.upperCase,
  valueModifierNegative: characters.values.modifiers.negative,
  valueModifierUnicode: characters.values.modifiers.unicode,
  valueUnicodeNibble: makeRegexpFromValuesInObject(characters.values.unicode),
  valueNull: characters.values.other.null,
  valueNumber: makeRegexpFromValuesInObject(characters.values.numbers),
  valueNumeral: makeRegexpFromValuesInObject(characters.values.numerals),
};

export const lookupTable = switchKeysAndValuesInMultipleObjectsThenMerge([
  characters.keys.letters,
  characters.keys.numerals,
  characters.keys.unicode,
  characters.values.letters,
  characters.values.numerals,
  characters.values.numbers,
  characters.values.other,
  characters.values.booleans,
  characters.values.unicode,
]);

const keyUpperLetters: any = {};
forEach(characters.keys.letters, (value, key) => {
  keyUpperLetters[key.toUpperCase()] =
    characters.keys.modifiers.upperCase + value;
});

const valueUpperLetters: any = {};
forEach(characters.values.letters, (value, key) => {
  valueUpperLetters[key.toUpperCase()] =
    characters.values.modifiers.upperCase + value;
});

export const conversionTable: any = {
  keys: merge(
    {},
    characters.keys.letters,
    keyUpperLetters,
    characters.keys.numerals
  ),
  numbers: merge({}, characters.values.numbers, {
    '-': characters.values.modifiers.negative,
  }),
  strings: merge(
    {},
    characters.values.letters,
    valueUpperLetters,
    characters.values.numerals
  ),
  unicode: {
    keys: characters.keys.unicode,
    values: characters.values.unicode,
  },
};

export const unicodeTable: any = {
  keys: characters.keys.unicode,
  values: characters.values.unicode,
};
