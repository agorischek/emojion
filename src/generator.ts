import { typeOf } from './typer';
import { characters } from './characters';
import { convert } from './mapper';
import { forOwn } from 'lodash';

export const generate = (input: any) => {
  const parsed = JSON.parse(input);
  const generated =
    characters.document.start +
    processDocument(parsed) +
    characters.document.end;
  return generated;
};

const processDocument = (input: any) => {
  const type = typeOf(input);
  if (type === 'object') {
    return processObject(input, true);
  } else if (type === 'array') {
    return processArray(input);
  } else if (type === 'boolean') {
    return processBoolean(input);
  } else if (type === 'null') {
    return processNull();
  } else {
    return '';
  }
};

const processValue = (input: any) => {
  const type = typeOf(input);
  if (type === 'object') {
    return processObject(input, false);
  } else if (type === 'array') {
    return processArray(input);
  } else if (type === 'string') {
    return processString(input);
  } else if (type === 'boolean') {
    return processBoolean(input);
  } else if (type === 'number') {
    return processNumber(input);
  } else if (type === 'null') {
    return processNull();
  } else {
    return '';
  }
};

const processObject = (input: object) => {
  const converted: string[] = [];
  forOwn(input, (value, key) => {
    converted.push(processProperty({ key: key, value: value }));
  });
  return converted;
};

interface Property {
  key: string;
  value: string;
}

const processProperty = (input: Property) => {
  const convertedKey = [...input.key].map(i => convert.key(i)).join('');
  const convertedValue = processValue(input.value);
  const converted = convertedKey + convertedValue;
  return converted;
};

const processArray = (input: []) => {
  const converted = input.map(x => x).join(characters.document.arrayDelimit);
  const generated =
    characters.document.arrayOpen + converted + characters.document.arrayClose;
  return generated;
};

const processString = (input: string) => {
  const convertedString = [...input].map(x => convert.value(x)).join('');
  return convertedString;
};

const processBoolean = (input: boolean) => {
  if (input === true) {
    return characters.values.booleans.true;
  } else {
    return characters.values.booleans.false;
  }
};

const processNumber = (input: number) => {
  const inputString = input.toString();
  const convertedNumber = [...inputString].map(x => convert.number(x)).join('');
  return convertedNumber;
};

const processNull = () => {
  return characters.values.other.null;
};
