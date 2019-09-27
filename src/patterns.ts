import { characters } from './characters';
import { collapse } from './mapper';

export const patterns = {
  documentEnd: characters.document.end,
  documentIndent: characters.document.indent,
  documentOutdent: characters.document.outdent,
  documentStart: characters.document.start,
  keyLetter: collapse(characters.keys.letters),
  keyNumeral: collapse(characters.keys.numerals),
  keyModifier: characters.keys.modifiers.upperCase,
  valueLetter: collapse(characters.values.letters),
  valueNumeral: collapse(characters.values.numerals),
  valueModifier: characters.values.modifiers.upperCase,
  number: collapse(characters.values.numbers),
  null: characters.values.other.null,
  bool: collapse(characters.values.booleans),
};
