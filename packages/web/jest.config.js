module.exports = {
	moduleFileExtensions: [ 'ts', 'js' ],
	rootDir: '../',
	coverageDirectory: '<rootDir>/web/coverage',
	testMatch: [
		'<rootDir>/(common|web)/tests/**/*.test.(ts|js)'
	],
	preset: 'ts-jest',
	setupFiles: [
		'<rootDir>/common/tests/setup/browsers.ts',
		'<rootDir>/common/tests/setup/connection.ts'
	]
}
