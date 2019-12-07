@preprocessor typescript

@{%
  import { lexer } from '../src/lexer'
  import {
    ASSEMBLEOBJECT, BUILDFLOAT, BUILDUNICODE, COLLAPSEARRAY, CONCAT,
    CONCATWRAPSTRING, CONVERT, CONVERTMULTIPLE, CONVERTUPPER, EMPTYSTRING, PAIR,
    SELF, TAKESECOND, WRAPSTRING
    } from '../src/postprocessor'
%}

@lexer lexer

document -> %documentStart content %documentEnd {% TAKESECOND %}
content ->
    properties {% SELF %}
  | array {% SELF %}
  | %valueBool {% CONVERT %}
  | %valueNull {% CONVERT %}
properties -> property:* {% ASSEMBLEOBJECT %}
property -> key value {% PAIR %}
property -> key object {% PAIR %}
object -> %documentIndent properties %documentOutdent {% TAKESECOND %}

key -> keySection:+ {% WRAPSTRING %}
key -> %keyEmptyString {% EMPTYSTRING %}
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
  | integer {% SELF %}
  | float {% SELF %}
  | %valueBool {% CONVERT %}
  | %valueNull {% CONVERT %}
integer -> number:+ {% CONCAT %}
float -> number:+ decimalPoint number:+ {% BUILDFLOAT %}
decimalPoint -> %valueDecimal {% CONVERT %}
array -> %arrayOpen initialArrayItem additionalArrayItem:* %arrayClose {% COLLAPSEARRAY %}
initialArrayItem -> value
additionalArrayItem -> %arrayDelimit value {% TAKESECOND %}
string -> valueStringSection:+ {% CONCATWRAPSTRING %}
string -> %valueEmptyString {% EMPTYSTRING %}
valueStringSection ->
    valueStringUnicodeCharacter {% BUILDUNICODE %}
  | valueStringCharacter
valueStringUnicodeCharacter -> %valueModifierUnicode valueUnicodeNibbles {% TAKESECOND %}
valueUnicodeNibbles -> %valueUnicodeNibble:+ {% CONVERTMULTIPLE %}
valueStringCharacter ->
    valueLowerCaseLetter
  | valueUpperCaseLetter
  | valueNumeral
valueLowerCaseLetter -> %valueLetter {% CONVERT %}
valueUpperCaseLetter -> %valueModifierUpper %valueLetter {% CONVERTUPPER %}
valueNumeral -> %valueNumeral {% CONVERT %}
number -> %valueNumber {% CONVERT %}
