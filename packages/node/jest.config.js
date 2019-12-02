module.exports = {
  moduleFileExtensions: [ 'ts', 'js' ],
  rootDir: '../',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/node/tsconfig.json'
    }
  },
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
  testEnvironment: 'node',
  setupFiles: [
    '<rootDir>/common/tests/setup/connection.ts'
  ]
}
