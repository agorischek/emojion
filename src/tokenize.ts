import * as moo from 'moo';

export const tokenize = function(dict: moo.Rules, doc: string) {
  const lexer = moo.compile(dict);
  lexer.reset(doc);
  let currentToken = lexer.next();
  const tokens = [];
  while (currentToken) {
    tokens.push(currentToken);
    currentToken = lexer.next();
  }
  return tokens;
};
