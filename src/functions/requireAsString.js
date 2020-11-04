const fs = require('fs');

/**
 * Get text contents of a file as string.
 * @param {string} fileLocation File location i.e. 'path/to/your/file.html'
 */
function requireAsString(fileLocation) {
	return fs
		.readFileSync(`${__dirname}/${fileLocation}`, (error, data) => {
			if (error) throw new Error('Unable to read SVG file.');
		})
		.toString('utf-8');
}

module.exports = requireAsString;
