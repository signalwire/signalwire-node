module.exports = {
	moduleFileExtensions: [ 'ts', 'js' ],
	rootDir: '../',
	coverageDirectory: '<rootDir>/web/coverage',
	testMatch: [
		'<rootDir>/(common|web)/tests/**/*.test.(ts|js)'
	],
	transform: {
		'^.+\\.tsx?$': './web/node_modules/ts-jest/dist/'
	},
	moduleDirectories: [
		"<rootDir>/web/node_modules"
	],
	setupFiles: [
		'<rootDir>/common/tests/setup/browsers.ts',
		'<rootDir>/common/tests/setup/connection.ts'
	]
}
