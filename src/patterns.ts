import { characters } from './characters';
import { collapse, flipMultiple } from './utilities';
import { merge, forEach } from 'lodash';

export const patterns = {
  arrayClose: characters.document.arrayClose,
  arrayDelimit: characters.document.arrayDelimit,
  arrayOpen: characters.document.arrayOpen,
  documentEnd: characters.document.end,
  documentIndent: characters.document.indent,
  documentOutdent: characters.document.outdent,
  documentStart: characters.document.start,
  keyLetter: collapse(characters.keys.letters),
  keyModifier: characters.keys.modifiers.upperCase,
  keyNumeral: collapse(characters.keys.numerals),
  valueBool: collapse(characters.values.booleans),
  valueLetter: collapse(characters.values.letters),
  valueModifier: characters.values.modifiers.upperCase,
  valueNull: characters.values.other.null,
  valueNumber: collapse(characters.values.numbers),
  valueNumeral: collapse(characters.values.numerals),
};

export const lookupTable = flipMultiple([
  characters.keys.letters,
  characters.keys.numerals,
  characters.values.letters,
  characters.values.numerals,
  characters.values.numbers,
  characters.values.other,
  characters.values.booleans,
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
  strings: merge(
    {},
    characters.values.letters,
    valueUpperLetters,
    characters.values.numerals
  ),
  numbers: characters.values.numbers,
};
