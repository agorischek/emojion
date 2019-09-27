import * as nearley from 'nearley';
import grammar = require('../modules/grammar.js');

const compiledGrammar = nearley.Grammar.fromCompiled(grammar);

export const parser = new nearley.Parser(compiledGrammar);

export const parse = (input: string) => {
  const parser = new nearley.Parser(compiledGrammar);
  parser.feed(input);
  return parser.results[0];
};
