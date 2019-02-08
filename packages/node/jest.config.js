module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  moduleFileExtensions: [
    'ts',
    'js'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  rootDir: '../',
  coverageDirectory: './node/coverage',
  testMatch: [
    '**/(common|node)/tests/**/*.test.(ts|js)'
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: [
    './common/tests/browserMocks.ts'
  ]
}
