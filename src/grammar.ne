@preprocessor typescript

@{%
  import { lexer } from '../src/lexer'
  import {
    EMPTYOBJECT, PAIR, WRAPSTRING, CONVERT,
    CONVERTUPPER, CONCAT, CONCATWRAPSTRING, COLLAPSEARRAY, TAKESECOND,
    SELF, ASSEMBLEOBJECT
    } from '../src/postprocessor'
%}

@lexer lexer

document -> %documentStart %documentEnd {% EMPTYOBJECT %}
document -> %documentStart content %documentEnd {% TAKESECOND %}
content ->
    properties {% SELF %}
  | array {% SELF %}
  | %valueBool {% CONVERT %}
  | %valueNull {% CONVERT %}
properties -> property:+ {% ASSEMBLEOBJECT %}
property -> key value {% PAIR %}
property -> key object {% PAIR %}
object -> %documentIndent properties %documentOutdent {% TAKESECOND %}
key -> keyCharacter:+ {% WRAPSTRING %}
keyCharacter ->
    keyLowerCaseLetter
  | keyUpperCaseLetter
  | keyNumeral
keyLowerCaseLetter -> %keyLetter {% CONVERT %}
keyUpperCaseLetter -> %keyModifier %keyLetter {% CONVERTUPPER %}
keyNumeral -> %keyNumeral {% CONVERT %}
value ->
    array
  | string
  | number:+ {% CONCAT %}
  | %valueBool {% CONVERT %}
  | %valueNull {% CONVERT %}
array -> %arrayOpen initialArrayItem additionalArrayItem:* %arrayClose {% COLLAPSEARRAY %}
initialArrayItem -> value
additionalArrayItem -> %arrayDelimit value {% TAKESECOND %}
string -> valueStringCharacter:+ {% CONCATWRAPSTRING %}
valueStringCharacter ->
    valueLowerCaseLetter
  | valueUpperCaseLetter
  | valueNumeral
valueLowerCaseLetter -> %valueLetter {% CONVERT %}
valueUpperCaseLetter -> %valueModifier %valueLetter {% CONVERTUPPER %}
valueNumeral -> %valueNumeral {% CONVERT %}
number -> %valueNumber {% CONVERT %}
