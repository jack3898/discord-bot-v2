const fetch = require('node-fetch');
const ytdl = require('ytdl-core');

/**
 * A YouTube video instance. Contains basic information about a YouTube video with a provided URL.
 */
class YouTubeVideo {
	constructor(url, details) {
		this.videourl = url;
		this._details = details;
	}

	get url() {
		return this.videourl;
	}

	/**
	 * Get all video details
	 * @returns {object} all video details
	 */
	get all() {
		return this._details;
	}
}

module.exports = YouTubeVideo;
