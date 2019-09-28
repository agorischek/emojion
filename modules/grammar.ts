// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var documentStart: any;
declare var documentEnd: any;
declare var documentIndent: any;
declare var documentOutdent: any;
declare var keyLetter: any;
declare var keyModifier: any;
declare var keyNumeral: any;
declare var valueBool: any;
declare var valueNull: any;
declare var valueLetter: any;
declare var valueModifier: any;
declare var valueNumeral: any;
declare var valueNumber: any;

  import { lexer } from '../src/lexer'
  import { EMPTYOBJECT, WRAPOBJECT, JOIN, PAIR, WRAPSTRING, CONVERT,
    CONVERTUPPER, CONCAT, CONCATWRAPSTRING } from '../src/postprocessor'

interface NearleyToken {  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: NearleyToken) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "document", "symbols": [(lexer.has("documentStart") ? {type: "documentStart"} : documentStart), (lexer.has("documentEnd") ? {type: "documentEnd"} : documentEnd)], "postprocess": EMPTYOBJECT},
    {"name": "document", "symbols": [(lexer.has("documentStart") ? {type: "documentStart"} : documentStart), "content", (lexer.has("documentEnd") ? {type: "documentEnd"} : documentEnd)], "postprocess": WRAPOBJECT},
    {"name": "content$ebnf$1", "symbols": ["property"]},
    {"name": "content$ebnf$1", "symbols": ["content$ebnf$1", "property"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "content", "symbols": ["content$ebnf$1"], "postprocess": JOIN},
    {"name": "property", "symbols": ["key", "value"], "postprocess": PAIR},
    {"name": "property", "symbols": ["key", "object"], "postprocess": PAIR},
    {"name": "object", "symbols": [(lexer.has("documentIndent") ? {type: "documentIndent"} : documentIndent), "content", (lexer.has("documentOutdent") ? {type: "documentOutdent"} : documentOutdent)], "postprocess": WRAPOBJECT},
    {"name": "key$ebnf$1", "symbols": ["keyCharacter"]},
    {"name": "key$ebnf$1", "symbols": ["key$ebnf$1", "keyCharacter"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "key", "symbols": ["key$ebnf$1"], "postprocess": WRAPSTRING},
    {"name": "keyCharacter", "symbols": ["keyLowerCaseLetter"]},
    {"name": "keyCharacter", "symbols": ["keyUpperCaseLetter"]},
    {"name": "keyCharacter", "symbols": ["keyNumeral"]},
    {"name": "keyLowerCaseLetter", "symbols": [(lexer.has("keyLetter") ? {type: "keyLetter"} : keyLetter)], "postprocess": CONVERT},
    {"name": "keyUpperCaseLetter", "symbols": [(lexer.has("keyModifier") ? {type: "keyModifier"} : keyModifier), (lexer.has("keyLetter") ? {type: "keyLetter"} : keyLetter)], "postprocess": CONVERTUPPER},
    {"name": "keyNumeral", "symbols": [(lexer.has("keyNumeral") ? {type: "keyNumeral"} : keyNumeral)], "postprocess": CONVERT},
    {"name": "value", "symbols": ["string"]},
    {"name": "value$ebnf$1", "symbols": ["number"]},
    {"name": "value$ebnf$1", "symbols": ["value$ebnf$1", "number"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "value", "symbols": ["value$ebnf$1"], "postprocess": CONCAT},
    {"name": "value", "symbols": [(lexer.has("valueBool") ? {type: "valueBool"} : valueBool)], "postprocess": CONVERT},
    {"name": "value", "symbols": [(lexer.has("valueNull") ? {type: "valueNull"} : valueNull)], "postprocess": CONVERT},
    {"name": "string$ebnf$1", "symbols": ["valueStringCharacter"]},
    {"name": "string$ebnf$1", "symbols": ["string$ebnf$1", "valueStringCharacter"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "string", "symbols": ["string$ebnf$1"], "postprocess": CONCATWRAPSTRING},
    {"name": "valueStringCharacter", "symbols": ["valueLowerCaseLetter"]},
    {"name": "valueStringCharacter", "symbols": ["valueUpperCaseLetter"]},
    {"name": "valueStringCharacter", "symbols": ["valueNumeral"]},
    {"name": "valueLowerCaseLetter", "symbols": [(lexer.has("valueLetter") ? {type: "valueLetter"} : valueLetter)], "postprocess": CONVERT},
    {"name": "valueUpperCaseLetter", "symbols": [(lexer.has("valueModifier") ? {type: "valueModifier"} : valueModifier), (lexer.has("valueLetter") ? {type: "valueLetter"} : valueLetter)], "postprocess": CONVERTUPPER},
    {"name": "valueNumeral", "symbols": [(lexer.has("valueNumeral") ? {type: "valueNumeral"} : valueNumeral)], "postprocess": CONVERT},
    {"name": "number", "symbols": [(lexer.has("valueNumber") ? {type: "valueNumber"} : valueNumber)], "postprocess": CONVERT}
  ],
  ParserStart: "document",
};

export default grammar;
