module.exports = {
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.es5.json',
		},
	},
	moduleFileExtensions: [
		'js',
		'ts',
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
	testMatch: [
		'**/tests/**/*.test.(ts|js)',
	],
	preset: 'ts-jest',
	// testEnvironment: 'node',
}
