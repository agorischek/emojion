import * as moo from 'moo';
import { patterns } from './patterns';

export const lexer = moo.compile(patterns);

export const lex = (doc: string) => {
  lexer.reset(doc);
  let currentToken = lexer.next();
  const tokens = [];
  while (currentToken) {
    tokens.push(currentToken);
    currentToken = lexer.next();
  }
  return tokens;
};
