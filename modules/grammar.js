// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

  const lexer = require('../src/lexer').lexer
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "document", "symbols": [(lexer.has("documentStart") ? {type: "documentStart"} : documentStart), (lexer.has("documentEnd") ? {type: "documentEnd"} : documentEnd)], "postprocess": function(d){return '{}';}},
    {"name": "document", "symbols": [(lexer.has("documentStart") ? {type: "documentStart"} : documentStart), "content", (lexer.has("documentEnd") ? {type: "documentEnd"} : documentEnd)], "postprocess": function(d){return '{' + d[1] + '}';}},
    {"name": "content$ebnf$1", "symbols": ["property"]},
    {"name": "content$ebnf$1", "symbols": ["content$ebnf$1", "property"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "content", "symbols": ["content$ebnf$1"]},
    {"name": "property", "symbols": ["key", "value"], "postprocess": function(d){ return d[0] + ':' + d[1] ;}},
    {"name": "property", "symbols": ["key", "object"], "postprocess": function(d){ return d[0] + ':' + d[1] ;}},
    {"name": "object", "symbols": [(lexer.has("documentIndent") ? {type: "documentIndent"} : documentIndent), "content", (lexer.has("documentOutdent") ? {type: "documentOutdent"} : documentOutdent)], "postprocess": function(d){ return '{' + d[1] + '}'; }},
    {"name": "key$ebnf$1", "symbols": ["keyCharacter"]},
    {"name": "key$ebnf$1", "symbols": ["key$ebnf$1", "keyCharacter"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "key", "symbols": ["key$ebnf$1"], "postprocess": function(d){ return '"' + d[0] + '"'; }},
    {"name": "keyCharacter", "symbols": ["keyLowerCaseLetter"]},
    {"name": "keyCharacter", "symbols": ["keyUpperCaseLetter"]},
    {"name": "keyCharacter", "symbols": ["keyNumeral"]},
    {"name": "keyLowerCaseLetter", "symbols": [(lexer.has("keyLetter") ? {type: "keyLetter"} : keyLetter)]},
    {"name": "keyUpperCaseLetter", "symbols": [(lexer.has("keyModifier") ? {type: "keyModifier"} : keyModifier), (lexer.has("keyLetter") ? {type: "keyLetter"} : keyLetter)]},
    {"name": "keyNumeral", "symbols": [(lexer.has("keyNumeral") ? {type: "keyNumeral"} : keyNumeral)]},
    {"name": "value", "symbols": ["string"]},
    {"name": "value$ebnf$1", "symbols": [(lexer.has("number") ? {type: "number"} : number)]},
    {"name": "value$ebnf$1", "symbols": ["value$ebnf$1", (lexer.has("number") ? {type: "number"} : number)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "value", "symbols": ["value$ebnf$1"]},
    {"name": "value", "symbols": [(lexer.has("bool") ? {type: "bool"} : bool)]},
    {"name": "value", "symbols": [(lexer.has("null") ? {type: "null"} : null)]},
    {"name": "string$ebnf$1", "symbols": ["valueStringCharacter"]},
    {"name": "string$ebnf$1", "symbols": ["string$ebnf$1", "valueStringCharacter"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "string", "symbols": ["string$ebnf$1"], "postprocess": function(d){ return '"' + d[0] + '"'; }},
    {"name": "valueStringCharacter", "symbols": ["valueLowerCaseLetter"]},
    {"name": "valueStringCharacter", "symbols": ["valueUpperCaseLetter"]},
    {"name": "valueStringCharacter", "symbols": ["valueNumeral"]},
    {"name": "valueLowerCaseLetter", "symbols": [(lexer.has("valueLetter") ? {type: "valueLetter"} : valueLetter)]},
    {"name": "valueNumeral", "symbols": [(lexer.has("valueNumeral") ? {type: "valueNumeral"} : valueNumeral)]}
]
  , ParserStart: "document"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
