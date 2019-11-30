import { lookupTable, conversionTable } from './patterns';
import { characters } from './characters';

export const lookUp = (character: string) => lookupTable[character];

export const convert = {
  key: (character: string) => {
    if (conversionTable.keys[character]) {
      return conversionTable.keys[character];
    } else {
      const codePoint = character.codePointAt(0).toString(16);
      const encoded =
        characters.keys.modifiers.unicode +
        [...codePoint].map(x => conversionTable.unicode.keys[x]).join('');
      return encoded;
    }
  },
  value: (character: string) => {
    if (conversionTable.strings[character]) {
      return conversionTable.strings[character];
    } else {
      const codePoint = character.codePointAt(0).toString(16);
      const encoded =
        characters.values.modifiers.unicode +
        [...codePoint].map(x => conversionTable.unicode.values[x]).join('');
      return encoded;
    }
  },
  number: (character: string) => {
    return conversionTable.numbers[character];
  },
};
