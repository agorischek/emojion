// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function() {
  function id(x) {
    return x[0];
  }

  const lexer = require('../src/lexer').lexer;
  var grammar = {
    Lexer: lexer,
    ParserRules: [
      {
        name: 'document',
        symbols: [
          lexer.has('documentStart')
            ? { type: 'documentStart' }
            : documentStart,
          lexer.has('documentEnd') ? { type: 'documentEnd' } : documentEnd,
        ],
      },
      {
        name: 'document',
        symbols: [
          lexer.has('documentStart')
            ? { type: 'documentStart' }
            : documentStart,
          'content',
          lexer.has('documentEnd') ? { type: 'documentEnd' } : documentEnd,
        ],
      },
      { name: 'content$ebnf$1', symbols: ['property'] },
      {
        name: 'content$ebnf$1',
        symbols: ['content$ebnf$1', 'property'],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      { name: 'content', symbols: ['content$ebnf$1'] },
      {
        name: 'property',
        symbols: [
          lexer.has('key') ? { type: 'key' } : key,
          lexer.has('value') ? { type: 'value' } : value,
        ],
      },
      {
        name: 'property',
        symbols: [lexer.has('key') ? { type: 'key' } : key, 'object'],
      },
      {
        name: 'object',
        symbols: [
          lexer.has('indent') ? { type: 'indent' } : indent,
          'content',
          lexer.has('outdent') ? { type: 'outdent' } : outdent,
        ],
      },
    ],
    ParserStart: 'document',
  };
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = grammar;
  } else {
    window.grammar = grammar;
  }
})();
