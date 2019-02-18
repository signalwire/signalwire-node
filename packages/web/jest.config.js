module.exports = {
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.es5.json'
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
	coverageDirectory: './web/coverage',
	testMatch: [
		'**/(common|web)/tests/**/*.test.(ts|js)'
	],
	preset: 'ts-jest',
	setupFiles: [
		'./common/tests/setup/browsers.ts',
		'./common/tests/setup/connection.ts'
	]
}
