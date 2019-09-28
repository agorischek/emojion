import { lookUp } from './mapper';

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
  return '"' + d[0] + '"';
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
