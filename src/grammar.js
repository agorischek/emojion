// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

  const lexer = require('./lexer').lexer
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "document", "symbols": [(lexer.has("documentStart") ? {type: "documentStart"} : documentStart), (lexer.has("documentEnd") ? {type: "documentEnd"} : documentEnd)]}
]
  , ParserStart: "document"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
