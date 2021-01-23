const fetch = require('node-fetch');

/**
 * A YouTube video instance. Contains basic information about a YouTube video with a provided URL.
 */
class YouTubeVideo {
	constructor(url) {
		this.videourl = url;
		this._details = this.fetchFromApi(url);
	}

	fetchFromApi(videoUrl) {
		const url = `https://www.youtube.com/oembed?url=${videoUrl}&index=7&format=json`;
		return fetch(url).then(data => data.json());
	}

	get url() {
		return this.videourl;
	}

	/**
	 * Get all video details
	 * @returns {Promise}
	 */
	get all() {
		return this._details.then(json => json);
	}

	/**
	 * Get video title
	 * @returns {Promise}
	 */
	get title() {
		return this._details.then(json => json.title);
	}

	/**
	 * Get video channel name / author
	 * @returns {Promise}
	 */
	get author() {
		return this._details.then(json => json.author_name);
	}

	/**
	 * Get the URL to the channel
	 * @returns {Promise}
	 */
	get authorUrl() {
		return this._details.then(json => json.author_url);
	}

	/**
	 * Get the thumbnail URL
	 * @returns {Promise}
	 */
	get thumbnailUrl() {
		return this._details.then(json => json.thumbnail_url);
	}
}

module.exports = YouTubeVideo;
