// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

  const lexer = require('../src/lexer').lexer
  const lookUp = require('../src/mapper').lookUp
  const lookupTable = require('../src/patterns').lookupTable
  const EMPTYOBJECT = function() { return '{}'; }
  const WRAPOBJECT = function(d) {return '{' + d[1] + '}'; }
  const JOIN = function(d){ return d[0].join(","); }
  const PAIR = function(d){ return d[0] + ':' + d[1]; }
  const WRAPSTRING = function(d){ return '"' + d[0] + '"'; }
  const CONVERT = function(d){ return lookUp(d[0]); }
  const CONVERTUPPER = function(d){ return lookUp(d[1]).toUpperCase(); }
  const CONCAT = function(d){ return d[0].join(""); }
  const CONCATWRAPSTRING = function(d){ return '"' + d[0].join("") + '"'; }
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "document", "symbols": [(lexer.has("documentStart") ? {type: "documentStart"} : documentStart), (lexer.has("documentEnd") ? {type: "documentEnd"} : documentEnd)], "postprocess": EMPTYOBJECT},
    {"name": "document", "symbols": [(lexer.has("documentStart") ? {type: "documentStart"} : documentStart), "content", (lexer.has("documentEnd") ? {type: "documentEnd"} : documentEnd)], "postprocess": WRAPOBJECT},
    {"name": "content$ebnf$1", "symbols": ["property"]},
    {"name": "content$ebnf$1", "symbols": ["content$ebnf$1", "property"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "content", "symbols": ["content$ebnf$1"], "postprocess": JOIN},
    {"name": "property", "symbols": ["key", "value"], "postprocess": PAIR},
    {"name": "property", "symbols": ["key", "object"], "postprocess": PAIR},
    {"name": "object", "symbols": [(lexer.has("documentIndent") ? {type: "documentIndent"} : documentIndent), "content", (lexer.has("documentOutdent") ? {type: "documentOutdent"} : documentOutdent)], "postprocess": WRAPOBJECT},
    {"name": "key$ebnf$1", "symbols": ["keyCharacter"]},
    {"name": "key$ebnf$1", "symbols": ["key$ebnf$1", "keyCharacter"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "key", "symbols": ["key$ebnf$1"], "postprocess": WRAPSTRING},
    {"name": "keyCharacter", "symbols": ["keyLowerCaseLetter"]},
    {"name": "keyCharacter", "symbols": ["keyUpperCaseLetter"]},
    {"name": "keyCharacter", "symbols": ["keyNumeral"]},
    {"name": "keyLowerCaseLetter", "symbols": [(lexer.has("keyLetter") ? {type: "keyLetter"} : keyLetter)], "postprocess": CONVERT},
    {"name": "keyUpperCaseLetter", "symbols": [(lexer.has("keyModifier") ? {type: "keyModifier"} : keyModifier), (lexer.has("keyLetter") ? {type: "keyLetter"} : keyLetter)], "postprocess": CONVERTUPPER},
    {"name": "keyNumeral", "symbols": [(lexer.has("keyNumeral") ? {type: "keyNumeral"} : keyNumeral)], "postprocess": CONVERT},
    {"name": "value", "symbols": ["string"]},
    {"name": "value$ebnf$1", "symbols": ["number"]},
    {"name": "value$ebnf$1", "symbols": ["value$ebnf$1", "number"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "value", "symbols": ["value$ebnf$1"], "postprocess": CONCAT},
    {"name": "value", "symbols": [(lexer.has("valueBool") ? {type: "valueBool"} : valueBool)], "postprocess": CONVERT},
    {"name": "value", "symbols": [(lexer.has("valueNull") ? {type: "valueNull"} : valueNull)], "postprocess": CONVERT},
    {"name": "string$ebnf$1", "symbols": ["valueStringCharacter"]},
    {"name": "string$ebnf$1", "symbols": ["string$ebnf$1", "valueStringCharacter"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "string", "symbols": ["string$ebnf$1"], "postprocess": CONCATWRAPSTRING},
    {"name": "valueStringCharacter", "symbols": ["valueLowerCaseLetter"]},
    {"name": "valueStringCharacter", "symbols": ["valueUpperCaseLetter"]},
    {"name": "valueStringCharacter", "symbols": ["valueNumeral"]},
    {"name": "valueLowerCaseLetter", "symbols": [(lexer.has("valueLetter") ? {type: "valueLetter"} : valueLetter)], "postprocess": CONVERT},
    {"name": "valueUpperCaseLetter", "symbols": [(lexer.has("valueModifier") ? {type: "valueModifier"} : valueModifier), (lexer.has("valueLetter") ? {type: "valueLetter"} : valueLetter)], "postprocess": CONVERTUPPER},
    {"name": "valueNumeral", "symbols": [(lexer.has("valueNumeral") ? {type: "valueNumeral"} : valueNumeral)], "postprocess": CONVERT},
    {"name": "number", "symbols": [(lexer.has("valueNumber") ? {type: "valueNumber"} : valueNumber)], "postprocess": CONVERT}
]
  , ParserStart: "document"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
