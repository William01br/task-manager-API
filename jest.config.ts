import type { Config } from 'jest';
import path from 'node:path';

/**
   - There are asynchronous handlers left open, and I can’t close these operations.

   - The issue occurs in the GET handler of task.controller.get.integration.spec.ts, specifically in the routes that return a 404 status code.

   - The Supertest library throws an error, and I’m not sure how to fix it.

   - In theory, Supertest should close all connections it opens, but in this particular scenario it doesn’t.
   */

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
  globalSetup: '<rootDir>/test/setup/jest.global-setup.ts',
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.integration.ts'],
  moduleNameMapper: moduleNameMapper,
  collectCoverageFrom: ['<rootDir>/test/integration/**/*integration.spec.ts'],
  coverageDirectory: '<rootDir>/coverage/integration',
};

const config: Config = {
  projects: [unitConfig, integrationConfig],
};

export default config;
