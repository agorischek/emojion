import * as nearley from 'nearley';
import grammar = require('./grammar.js');

export const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

export const parse = (input: string) => {
  parser.feed(input);
  return parser.results[0];
};
