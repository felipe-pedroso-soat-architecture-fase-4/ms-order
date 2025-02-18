/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/**/*.ts"],
  testTimeout: 20000,
  setupFiles: ["<rootDir>/jest.setup.js"],  
  collectCoverageFrom: [
    "**/src/**/*.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.yaml" 
  ]
};
