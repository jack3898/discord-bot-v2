/**
 * A universal filter for separating arguments in a command. Commands should have arguments in this syntax: "arg:value"
 * @param {string} item An Array item to test
 * @returns {Array} Filtered array
 */
function getArgsFilter(item) {
	return item.includes(':') && this.validArgs.some(validArg => item.startsWith(validArg));
}

/**
 * A universal array filter function to keep only words from a command. A standard word is something that does not have this syntax: "arg:value"
 * @param {string} item An Array item to test
 * @returns {Array} Filtered array
 */
function getWordsFilter(item) {
	return !item.includes(':') && !this.validArgs.some(validArg => item.startsWith(validArg));
}

module.exports = [getArgsFilter, getWordsFilter];
