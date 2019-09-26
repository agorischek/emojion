@{%
  const lexer = require('./lexer').lexer
%}

@lexer lexer

document -> %documentStart %documentEnd
