const { resolve } = require('node:path');
const root = resolve(__dirname);

module.exports = {
  rootDir: root,
  displayName: 'root-tests',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  testEnvorinment: 'node',
  clearMocks: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir:/src/$1',
    '^@test/(.*)$': '<rootDir:/test/$1',
  },
  collectCoverageFrom: ['<rootDir>/test/**/*.ts'],
  coverageDirectory: 'coverage',
};
