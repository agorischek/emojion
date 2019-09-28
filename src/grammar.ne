@preprocessor typescript

@{%
  import { lexer } from '../src/lexer'
  import { EMPTYOBJECT, WRAPOBJECT, JOIN, PAIR, WRAPSTRING, CONVERT,
    CONVERTUPPER, CONCAT, CONCATWRAPSTRING, COLLAPSEARRAY, TAKESECOND } from '../src/postprocessor'
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
