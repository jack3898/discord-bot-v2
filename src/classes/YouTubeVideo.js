/**
 * A YouTube video instance. Contains basic information about a YouTube video with a provided URL.
 */
class YouTubeVideo {
	/**
	 *
	 * @param {string} url The URL for a video
	 * @param {Object} details The object containing the video Details
	 * @param {User} user The user who owns this object
	 */
	constructor(url, details, user) {
		this.videourl = url;
		this._details = details;
		this._dateAdded = new Date();
		this._addedBy = user;
	}

	get url() {
		return this.videourl;
	}

	get owner() {
		return this._addedBy;
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
