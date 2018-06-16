module.exports = function (w) {

  return {
    files: [
      'ormconfig.json',
      'package.json',
      'src/**/*.ts',
      'src/**/*.graphql',
      '!src/**/*.test.ts',
    ],

    tests: [
      'src/**/*.test.ts'
    ],
    env: {
      type: 'node'
    },

    testFramework: 'jest'
  };
};
