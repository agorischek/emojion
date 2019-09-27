@{%
  const lexer = require('../src/lexer').lexer
%}

@lexer lexer

document -> %documentStart %documentEnd {% function(d){return '{}';} %}
document -> %documentStart content %documentEnd {% function(d){return '{' + d[1] + '}';} %}
content -> property:+
property -> key value {% function(d){ return d[0] + ':' + d[1] ;} %}
property -> key object {% function(d){ return d[0] + ':' + d[1] ;}  %}
object -> %documentIndent content %documentOutdent {% function(d){ return '{' + d[1] + '}'; } %}
key -> keyCharacter:+ {% function(d){ return '"' + d[0] + '"'; } %}
keyCharacter ->
    keyLowerCaseLetter
  | keyUpperCaseLetter
  | keyNumeral
keyLowerCaseLetter -> %keyLetter
keyUpperCaseLetter -> %keyModifier %keyLetter
keyNumeral -> %keyNumeral
value ->
    string
  | %number:+
  | %bool
  | %null
string -> valueStringCharacter:+ {% function(d){ return '"' + d[0] + '"'; } %}
valueStringCharacter ->
    valueLowerCaseLetter
  | valueUpperCaseLetter
  | valueNumeral
valueLowerCaseLetter -> %valueLetter
valueNumeral -> %valueNumeral
