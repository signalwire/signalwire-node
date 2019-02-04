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
	testMatch: [
		'**/test/**/*.test.(ts|js)'
	],
	preset: 'ts-jest',
	// testEnvironment: 'node'
}
