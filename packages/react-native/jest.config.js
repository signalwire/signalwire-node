module.exports = {
	moduleFileExtensions: ['ts', 'js'],
	testEnvironment: 'jsdom',
	rootDir: '../',
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/react-native/tsconfig.json'
		},
	},
	coverageDirectory: '<rootDir>/react-native/coverage',
	testMatch: [
		'<rootDir>/(common|react-native)/tests/**/*.test.(ts|js)'
	],
	transform: {
		'^.+\\.tsx?$': './react-native/node_modules/ts-jest/dist/'
	},
	moduleDirectories: [
		"<rootDir>/react-native/node_modules"
	],
	setupFiles: [
		'<rootDir>/common/tests/setup/browsers.ts',
		'<rootDir>/common/tests/setup/connection.ts'
	]
}
