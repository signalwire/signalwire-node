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
	rootDir: '../',
	testMatch: [
		'**/tests/(common|browser)/**/*.test.(ts|js)'
	],
	preset: 'ts-jest'
}
