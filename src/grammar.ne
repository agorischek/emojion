@{%
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
%}

@lexer lexer

document -> %documentStart %documentEnd {% EMPTYOBJECT %}
document -> %documentStart content %documentEnd {% WRAPOBJECT %}
content -> property:+ {% JOIN %}
property -> key value {% PAIR %}
property -> key object {% PAIR %}
object -> %documentIndent content %documentOutdent {% WRAPOBJECT %}
key -> keyCharacter:+ {% WRAPSTRING %}
keyCharacter ->
    keyLowerCaseLetter
  | keyUpperCaseLetter
  | keyNumeral
keyLowerCaseLetter -> %keyLetter {% CONVERT %}
keyUpperCaseLetter -> %keyModifier %keyLetter {% CONVERTUPPER %}
keyNumeral -> %keyNumeral {% CONVERT %}
value ->
    string
  | number:+ {% CONCAT %}
  | %valueBool {% CONVERT %}
  | %valueNull {% CONVERT %}
string -> valueStringCharacter:+ {% CONCATWRAPSTRING %}
valueStringCharacter ->
    valueLowerCaseLetter
  | valueUpperCaseLetter
  | valueNumeral
valueLowerCaseLetter -> %valueLetter {% CONVERT %}
valueUpperCaseLetter -> %valueModifier %valueLetter {% CONVERTUPPER %}
valueNumeral -> %valueNumeral {% CONVERT %}
number -> %valueNumber {% CONVERT %}
