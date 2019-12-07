import { lookUp } from './mapper';
import { charFromCodePoint } from './utilities';

export const EMPTYOBJECT = () => {
  return '{}';
};
export const WRAPOBJECT = (d: any) => {
  return '{' + d[0] + '}';
};
export const JOIN = (d: any) => {
  return d[0].join(',');
};
export const PAIR = (d: any) => {
  return d[0] + ':' + d[1];
};
export const WRAPSTRING = (d: any) => {
  return '"' + d[0].join('') + '"';
};
export const EMPTYSTRING = () => {
  return '\"\"';
};
export const CONVERT = (d: any) => {
  return lookUp(d[0]);
};
export const CONVERTUPPER = (d: any) => {
  return lookUp(d[1]).toUpperCase();
};
export const CONCAT = (d: any) => {
  return d[0].join('');
};
export const CONCATSECOND = (d: any) => {
  return d[1].join('');
};
export const BUILDINT = (d: any) => {
  const absolute = d[1].join('');
  return d[0] ? '-' + absolute : absolute;
};
export const BUILDFLOAT = (d: any) => {
  const absolute = d[1].join('') + d[2] + d[3].join('');
  return d[0] ? '-' + absolute : absolute;
};
export const CONCATWRAPSTRING = (d: any) => {
  return '"' + d[0].join('') + '"';
};
export const SELF = (d: any) => {
  return d[0];
};
export const TAKESECOND = (d: any) => {
  return d[1];
};
export const COLLAPSEARRAY = (d: any) => {
  if (d[2][0]) {
    return '[' + d[1] + ',' + d[2].join(',') + ']';
  } else {
    return '[' + d[1] + ']';
  }
};
export const ASSEMBLEOBJECT = (d: any) => {
  return '{' + d[0].join(',') + '}';
};
export const CONVERTMULTIPLE = (d: any) => {
  return d[0].map((x: any) => lookUp(x));
};
export const BUILDUNICODE = (d: any) => {
  return d[0].length > 0 ? charFromCodePoint(d[0].join('')) : null;
};
