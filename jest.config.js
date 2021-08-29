module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    "transformIgnorePatterns": [
      "node_modules/(?!@tolkam)/"
    ],
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx|js)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
