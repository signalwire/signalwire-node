module.exports = {
  moduleFileExtensions: [ 'ts', 'js' ],
  rootDir: '../',
  coverageDirectory: '<rootDir>/node/coverage',
  testMatch: [
    '<rootDir>/(common|node)/tests/**/*.test.(ts|js)'
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: [
    '<rootDir>/common/tests/setup/browsers.ts',
    '<rootDir>/common/tests/setup/connection.ts'
  ]
}
