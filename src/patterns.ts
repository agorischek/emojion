import { characters } from './characters';
import { collapse, flipMultiple } from './mapper';

export const patterns = {
  bool: collapse(characters.values.booleans),
  documentEnd: characters.document.end,
  documentIndent: characters.document.indent,
  documentOutdent: characters.document.outdent,
  documentStart: characters.document.start,
  keyLetter: collapse(characters.keys.letters),
  keyModifier: characters.keys.modifiers.upperCase,
  keyNumeral: collapse(characters.keys.numerals),
  null: characters.values.other.null,
  number: collapse(characters.values.numbers),
  valueLetter: collapse(characters.values.letters),
  valueModifier: characters.values.modifiers.upperCase,
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
