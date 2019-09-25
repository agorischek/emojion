import { tokenize } from './tokenize';
import { patterns } from './patterns';

export const lex = (input: string) => tokenize(patterns, input);
