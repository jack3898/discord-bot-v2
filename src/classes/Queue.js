class Queue {
	/**
	 * Queue system. Mainly for YouTube features buuuut could be useful for other things..
	 * @param {Guild} guild
	 */
	constructor(guild) {
		this._guild = guild;
		this._queue = []; // Set() is actually more of a pain than a help believe it or not.
		this._iterator = this._queue.values();
		this._current = undefined;
		this._voiceConnection = undefined;
	}

	/**
	 * Add an item to the queue whilst also ensuring the queue is not too long
	 * @param {*} item Which item do you want to add to the queue.
	 * @returns {boolean} was the job successful
	 */
	add(item) {
		if (!this._queue.find(arrItem => item == arrItem) && this._queue.length < 100) {
			this._queue.push(item);
			return true;
		}

		return false;
	}

	/**
	 * Get the whole queue.
	 * @returns {array | boolean}
	 */
	get queue() {
		return this._queue ? this.queue : false;
	}

	/**
	 * Get current item in the queue.
	 * @returns {* | boolean}
	 */
	get current() {
		return this._queue[0] ? this._queue[0] : false;
	}

	/**
	 * Get the next item in the queue. If we have come to an end, delete the queue from memory.
	 * @param {boolean} shift should the queue remove the current item before proceeding to the next?
	 */
	get next() {
		const item = this._queue[0];
		this._current = item;
		this._queue.shift();
		if (item) return item;

		return false;
	}

	get isLast() {
		if (this._queue.length === 1) return true;

		return false;
	}

	async connect(voiceChannel, callback) {
		this._voiceConnection = await voiceChannel.join();
		callback(this._voiceConnection);
	}
}

module.exports = Queue;
