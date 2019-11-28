module.exports = function() {
  return {
    files: ['src/**/*.ts', 'gen/**/*.ts'],
    tests: ['test/**/*.ts'],
    env: {
      type: 'node',
    },
    debug: true,
    testFramework: 'jest',
  };
};
