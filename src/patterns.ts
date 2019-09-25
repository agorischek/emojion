import { characters } from './characters';
import { collapseMultiple } from './collapse';

export const patterns = {
  documentEnd: characters.document.end,
  documentIndent: characters.document.indent,
  documentOutdent: characters.document.outdent,
  documentStart: characters.document.start,
  key: collapseMultiple([
    characters.keys.letters,
    characters.keys.numbers,
    characters.keys.modifiers,
  ]),
  value: collapseMultiple([
    characters.values.letters,
    characters.values.numbers,
    characters.values.numerals,
    characters.values.modifiers,
    characters.values.booleans,
    characters.values.other,
  ]),
};
