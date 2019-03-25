module.exports = {
  moduleFileExtensions: [ 'ts', 'js' ],
  rootDir: '../',
  coverageDirectory: '<rootDir>/node/coverage',
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/common/tests/webrtc/*'
  ],
  testMatch: [
    '<rootDir>/(common|node)/tests/**/*.test.(ts|js)'
  ],
  transform: {
    '^.+\\.tsx?$': './node/node_modules/ts-jest/dist/'
  },
  // moduleDirectories: [
  //   "<rootDir>/node/node_modules"
  // ],
  testEnvironment: 'node',
  setupFiles: [
    '<rootDir>/common/tests/setup/browsers.ts',
    '<rootDir>/common/tests/setup/connection.ts'
  ]
}
