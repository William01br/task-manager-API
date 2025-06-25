import type { Config } from 'jest';
import path from 'node:path';

const root = path.join(__dirname);
const moduleNameMapper = {
  '^@src/(.*)$': '<rootDir>/src/$1',
  '^@test/(.*)$': '<rootDir>/test/$1',
};

const unitConfig: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  displayName: 'unit',
  rootDir: root,
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.unit.ts'],
  testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
  moduleNameMapper: moduleNameMapper,
  collectCoverageFrom: ['<rootDir>/test/unit/**/*spec.ts'],
  coverageDirectory: '<rootDir>/coverage/unit',
};

const integrationConfig: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  displayName: 'integration',
  rootDir: root,
  testMatch: ['<rootDir>/test/integration/**/*integration.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.integration.ts'],
  moduleNameMapper: moduleNameMapper,
  collectCoverageFrom: ['<rootDir>/test/integration/**/*integration.spec.ts'],
  coverageDirectory: '<rootDir>/coverage/integration',
};

const config: Config = {
  projects: [unitConfig, integrationConfig],
};

export default config;
