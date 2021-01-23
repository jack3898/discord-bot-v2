const YouTube = require('./../classes/YouTube');

class yt {
	static name = 'yt';

	static async execute(msg, args) {
		// The Message instance is used to identify the guild and create a queue specific to that guild
		const youtube = YouTube.init(msg);
		youtube.do(msg, args);
	}
}

module.exports = yt;
