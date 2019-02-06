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
  testMatch: [
    '**/(common|node)/tests/**/*.test.(ts|js)'
  ],
  preset: 'ts-jest',
  testEnvironment: 'node'
}
