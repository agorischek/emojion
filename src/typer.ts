export const typeOf = (entity: any) => {
  if (typeof entity === 'string') {
    return 'string';
  } else if (typeof entity === 'number' && isFinite(entity)) {
    return 'number';
  } else if (
    entity &&
    typeof entity === 'object' &&
    entity.constructor === Array
  ) {
    return 'array';
  } else if (
    entity &&
    typeof entity === 'object' &&
    entity.constructor === Object
  ) {
    return 'object';
  } else if (entity === null) {
    return 'null';
  } else if (typeof entity === 'boolean') {
    return 'boolean';
  } else {
    return 'undetermined';
  }
};
