import * as nearley from 'nearley';
import grammar from '../gen/grammar';

const compiledGrammar = nearley.Grammar.fromCompiled(grammar);

export const parser = new nearley.Parser(compiledGrammar);

function clean(input: string) {
  return input.replace(/\s/g, '');
}

export const parse = (input: string) => {
  const wrappedParser = new nearley.Parser(compiledGrammar);
  const cleanedInput = clean(input);
  wrappedParser.feed(cleanedInput);
  return wrappedParser.results[0];
};

export const validateGrammar = (input: string) => {
  const wrappedParser = new nearley.Parser(compiledGrammar);
  const cleanedInput = clean(input);
  wrappedParser.feed(cleanedInput);
  if (wrappedParser.results.length === 1) {
    return true;
  } else {
    return false;
  }
};
