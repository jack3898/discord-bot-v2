const getFiles = require('../../functions/getFiles');

test('getFiles.js with no params', () => {
	expect(getFiles()).toEqual([]);
});

test('getFiles.js with correct param', () => {
	expect(getFiles('../../commands').length).toBeGreaterThan(0);
});

test('getFiles.js with incorrect param value but correct param type', () => {
	expect(getFiles('./fake')).toEqual([]);
});

test('getFiles.js with correct param & string as second param', () => {
	expect(getFiles('../../commands', 'js').length).toBeGreaterThan(0);
});

test('getFiles.js with correct param & array as second param', () => {
	expect(getFiles('../../commands', ['js']).length).toBeGreaterThan(0);
});

test('getFiles.js with correct param & incorrect second param', () => {
	expect(getFiles('../../commands', true)).toEqual([]);
});

test('getFiles.js with correct param & correct second param type with incorrect value', () => {
	expect(getFiles('../../commands', ['.fake'])).toEqual([]);
});
