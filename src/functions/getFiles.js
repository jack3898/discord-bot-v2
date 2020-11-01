const fs = require('fs');

/**
 * Search a directory for a collection of files for a given purpose
 * @param {string} directory Directory location relative to the location in which the function is invoked
 * @param {string | Array.<string>} [fileTypes=['.js']] A (list of) filetype(s) that should be included in the search
 * @returns {Array.<string>} A list of files
 */
function getFileList(directory, fileTypes = ['.js']) {
	try {
		if (!directory || typeof directory !== 'string') return [];
		const fileList = fs.readdirSync(__dirname + directory).filter(file => file.endsWith(fileTypes));
		return fileList;
	} catch (error) {
		console.log(error);
		return [];
	}
}

module.exports = getFileList;
