import * as nearley from 'nearley';
import grammar from '../modules/grammar';

const compiledGrammar = nearley.Grammar.fromCompiled(grammar);

export const parser = new nearley.Parser(compiledGrammar);

export const parse = (input: string) => {
  const wrappedParser = new nearley.Parser(compiledGrammar);
  wrappedParser.feed(input);
  return wrappedParser.results[0];
};

export const validateGrammar = (input: string) => {
  const wrappedParser = new nearley.Parser(compiledGrammar);
  wrappedParser.feed(input);
  if (wrappedParser.results.length === 1) {
    return true;
  } else {
    return false;
  }
};
