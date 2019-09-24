import { lex } from "./lex";
import { patterns } from "./patterns";

export const parse = (input: string) => lex(patterns, input);
