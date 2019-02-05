module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'scripts/tsconfig.node.json'
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
    '**/tests/(common|node)/**/*.test.(ts|js)'
  ],
  preset: 'ts-jest',
  testEnvironment: 'node'
}
