const YouTubeVideo = require('./YouTubeVideo');
const ytdl = require('ytdl-core-discord');

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
	 * @param {User} user The Discord user who wanted to add the item
	 * @param {string} item Which YouTube URL item do you want to add to the queue.
	 * @returns {Promise | boolean} Video that was added
	 */
	add(user, item) {
		return new Promise((resolve, reject) => {
			if (!this._queue.find(arrItem => item == arrItem.url) && this._queue.length < 100 && ytdl.validateURL(item)) {
				// getBasicInfo() is used to test whether the video is public or unlisted. If it is private the video will be skipped.
				resolve(
					ytdl
						.getBasicInfo(item)
						.then(info => {
							const video = new YouTubeVideo(item, info.videoDetails, user);
							this._queue.push(video);
							return video;
						})
						.catch(error => {
							console.log(error);
							console.error('A undiscoverable video was attempted to be added to a queue. Skipping...');
						})
				);
			} else {
				reject(false);
			}
		});
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
	 * TODO: Allow a parameter that can skip multiple items at once then utlise the removeFirst
	 * TODO: Allow loop, so that the same item is returned
	 * @param {boolean} shift should the queue remove the current item before proceeding to the next?
	 */
	get next() {
		const item = this._queue[0];
		this._queue.shift();
		if (item) return item;
		return false;
	}

	/**
	 * Get an item in the queue via an index
	 */
	queueItem(index) {
		const intIndex = parseInt(index);
		// NaN's type is still number, so we must also check for truthy/falsy
		if (typeof intIndex === 'number' && intIndex) return this?._queue[intIndex];
		else return false;
	}

	/**
	 * Remove an item from a queue using an index
	 */
	remove(index = 0) {
		try {
			if (index > -1) {
				this._queue.splice(index, 1);
				return true;
			} else return false;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	/**
	 * Remove the last item of the queue
	 * TODO: Add this
	 */
	removeLast() {}

	/**
	 * Remove the first item of the queue
	 * TODO: Add this
	 */
	removeFirst() {}

	/**
	 * Remove all items in the queue by a certain discord user. An additional property will need to be added to the YouTubeVideo class.
	 * TODO: Add this
	 */
	removeByAuthor() {}

	/**
	 * Remove all items in the queue that were added before, after or in-between a certain time
	 * TODO: Add this
	 */
	removeByTime() {}

	/**
	 * Shuffle the items in the queue
	 * TODO: Add this
	 */
	shuffle() {}

	/**
	 * Sort the queue by date, alphabetical, by artist etc.
	 * TODO: Add this
	 */
	organise() {}

	/**
	 * Prevent the addition of items to the queue
	 * TODO: Add this
	 */
	freeze() {}

	/**
	 * Unfreeze a frozen queue
	 * TODO: Add this
	 */
	unfreeze() {}

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
}

module.exports = Queue;
