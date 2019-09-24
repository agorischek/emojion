import { characters } from "./characters";

const keyCharactersArray: Array<string> = [];
Object.keys(characters.key).forEach(key => keyCharactersArray.push(key));
const keyCharacters = keyCharactersArray.join();

export const patterns = {
  documentEnd: characters.document.end,
  documentIndent: characters.document.indent,
  documentOutdent: characters.document.outdent,
  documentStart: characters.document.start,
  key: keyCharacters
};
