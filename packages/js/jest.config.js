module.exports = {
	moduleFileExtensions: [ 'ts', 'js' ],
	rootDir: '../',
	coverageDirectory: '<rootDir>/js/coverage',
	testMatch: [
		'<rootDir>/(common|js)/tests/**/*.test.(ts|js)'
	],
	transform: {
		'^.+\\.tsx?$': './js/node_modules/ts-jest/dist/'
	},
	moduleDirectories: [
		"<rootDir>/js/node_modules"
	],
	setupFiles: [
		'<rootDir>/common/tests/setup/browsers.ts',
		'<rootDir>/common/tests/setup/connection.ts'
	]
}
