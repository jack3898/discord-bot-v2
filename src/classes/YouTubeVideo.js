const fetch = require('node-fetch');

class YouTubeVideo {
	constructor(url) {
		this.videourl = url;
	}

	get url() {
		return this.videourl;
	}
}

module.exports = YouTubeVideo;
