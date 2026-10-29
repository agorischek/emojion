module.exports = function() {
  return {
    files: ['src/**/*.ts'],
    tests: ['test/**/*.ts', 'test/**/*.json', 'test/**/*.🙌'],
    env: {
      type: 'node',
    },
    debug: true,
    testFramework: 'jest',
  };
};
