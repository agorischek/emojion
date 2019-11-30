@preprocessor typescript

@{%
  import { lexer } from '../src/lexer'
  import {
    EMPTYOBJECT, PAIR, WRAPSTRING, CONVERT,
    CONVERTUPPER, CONCAT, CONCATWRAPSTRING, COLLAPSEARRAY, TAKESECOND,
    SELF, ASSEMBLEOBJECT, CONVERTMULTIPLE, BUILDUNICODE
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
key -> keySection:+ {% WRAPSTRING %}
keySection ->
    keyUnicodeCharacter {% BUILDUNICODE %}
  | keyCharacter
keyUnicodeCharacter -> %keyModifierUnicode keyUnicodeNibbles {% TAKESECOND %}
keyUnicodeNibbles -> %keyUnicodeNibble:* {% CONVERTMULTIPLE %}
keyCharacter ->
    keyLowerCaseLetter
  | keyUpperCaseLetter
  | keyNumeral
keyLowerCaseLetter -> %keyLetter {% CONVERT %}
keyUpperCaseLetter -> %keyModifierUpper %keyLetter {% CONVERTUPPER %}
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
valueUpperCaseLetter -> %valueModifierUpper %valueLetter {% CONVERTUPPER %}
valueNumeral -> %valueNumeral {% CONVERT %}
number -> %valueNumber {% CONVERT %}
