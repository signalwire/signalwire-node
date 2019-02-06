module.exports = {
	globals: {
		'ts-jest': {
			tsConfig: 'scripts/tsconfig.es5.json'
		}
	},
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	// rootDir: '../',
	testMatch: [
		'./tests/**/*.test.(ts|js)',
		'../common/tests/**/*.test.(ts|js)'
	],
	preset: 'ts-jest'
}
