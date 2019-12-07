import { characters } from './characters';
import { lookupTable, conversionTable } from './patterns';

export const lookUp = (character: string) => lookupTable[character];

export const convert = {
  key: (character: string) => {
    if (conversionTable.keys[character]) {
      return conversionTable.keys[character];
    } else {
      const decCodePoint = character.codePointAt(0);
      if (decCodePoint) {
        const hexCodePointString = decCodePoint.toString(16);
        const encoded =
          characters.keys.modifiers.unicode +
          [...hexCodePointString]
            .map(x => conversionTable.unicode.keys[x])
            .join('');
        return encoded;
      } else {
        return null;
      }
    }
  },
  value: (character: string) => {
    if (conversionTable.strings[character]) {
      return conversionTable.strings[character];
    } else {
      const decCodePoint = character.codePointAt(0);
      if (decCodePoint) {
        const hexCodePointString = decCodePoint.toString(16);
        const encoded =
          characters.values.modifiers.unicode +
          [...hexCodePointString]
            .map(x => conversionTable.unicode.values[x])
            .join('');
        return encoded;
      } else {
        return null;
      }
    }
  },
  number: (character: string) => {
    return conversionTable.numbers[character];
  },
};
