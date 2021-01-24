const YouTubeVideo = require('./YouTubeVideo');

class Queue {
	/**
	 * Queue system. Mainly for YouTube features buuuut could be useful for other things..
	 * @param {Guild} guild
	 */
	constructor(guild) {
		this._guild = guild;
		this._queue = []; // Set() is actually more of a pain than a help believe it or not.
		this._iterator = this._queue.values();
		this._voiceConnection = undefined;
	}

	/**
	 * Add an item to the queue whilst also ensuring the queue is not too long
	 * @param {*} item Which item do you want to add to the queue.
	 * @returns {boolean} was the job successful
	 */
	add(item) {
		if (!this._queue.find(arrItem => item == arrItem.url) && this._queue.length < 100) {
			const video = new YouTubeVideo(item);
			this._queue.push(video);
			return video;
		}
		return false;
	}

	/**
	 * Get the whole queue.
	 * @returns {array | boolean}
	 */
	get queue() {
		return this._queue ? this._queue : false;
	}

	/**
	 * Get the queue instance guild ID
	 * @returns {string}
	 */
	get queueGuildId() {
		return this._guild;
	}

	/**
	 * Get the next item in the queue. If we have come to an end, delete the queue from memory.
	 * @param {boolean} shift should the queue remove the current item before proceeding to the next?
	 */
	get next() {
		const item = this._queue[0];
		this._queue.shift();
		if (item) return item;
		return false;
	}

	get isLast() {
		if (this._queue.length === 1) return true;
		return false;
	}

	/**
	 * Clear the queue of its contents
	 * @returns {boolean}
	 */
	clear() {
		this._queue = [];
		return true;
	}

	async connect(voiceChannel, callback) {
		this._voiceConnection = await voiceChannel.join().catch(() => 'Issue joining channel.');
		callback(this._voiceConnection);
	}
}

module.exports = Queue;
