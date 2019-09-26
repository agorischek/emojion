@{%
  const lexer = require('./lexer').lexer
%}

@lexer lexer

document -> %documentStart %documentEnd
document -> %documentStart content %documentEnd
content -> property:+
property -> %key %value
property -> %key object
object -> %indent content %outdent
