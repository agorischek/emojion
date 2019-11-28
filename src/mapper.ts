import { lookupTable, conversionTable } from './patterns';

export const lookUp = (character: string) => lookupTable[character];

export const convert = {
  key: (character: string) => conversionTable.keys[character],
  value: (character: string) => conversionTable.strings[character],
  number: (character: string) => conversionTable.numbers[character],
};
