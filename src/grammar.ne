@{%
  const lexer = require('../src/lexer').lexer
  const lookUp = require('../src/mapper').lookUp
  const lookupTable = require('../src/patterns').lookupTable
%}

@lexer lexer

document -> %documentStart %documentEnd {% function(d){return '{}'; } %}
document -> %documentStart content %documentEnd {% function(d){return '{' + d[1] + '}'; } %}
content -> property:+
property -> key value {% function(d){ return d[0] + ':' + d[1]; } %}
property -> key object {% function(d){ return d[0] + ':' + d[1]; }  %}
object -> %documentIndent content %documentOutdent {% function(d){ return '{' + d[1] + '}'; } %}
key -> keyCharacter:+ {% function(d){ return '"' + d[0] + '"'; } %}
keyCharacter ->
    keyLowerCaseLetter
  | keyUpperCaseLetter
  | keyNumeral
keyLowerCaseLetter -> %keyLetter {% function(d){ return lookUp(d[0]); } %}
keyUpperCaseLetter -> %keyModifier %keyLetter {% function(d){ return lookUp(d[1]).toUpperCase(); } %}
keyNumeral -> %keyNumeral {% function(d){ return lookUp(d[0]); } %}
value ->
    string
  | number:+ {% function(d){ return d[0].join(""); } %}
  | %valueBool {% function(d){ return lookUp(d[0]); } %}
  | %valueNull {% function(d){ return lookUp(d[0]); } %}
string -> valueStringCharacter:+ {% function(d){ return '"' + d[0] + '"'; } %}
valueStringCharacter ->
    valueLowerCaseLetter
  | valueUpperCaseLetter
  | valueNumeral
valueLowerCaseLetter -> %valueLetter {% function(d){ return lookUp(d[0]); } %}
valueUpperCaseLetter -> %valueModifier %valueLetter {% function(d){ return lookUp(d[1]).toUpperCase(); } %}
valueNumeral -> %valueNumeral {% function(d){ return lookUp(d[0]); } %}
number -> %valueNumber {% function(d){ return lookUp(d[0]); } %}
