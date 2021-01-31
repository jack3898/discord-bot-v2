const Queue = require('./Queue');
const ytdl = require('ytdl-core-discord');
const fetch = require('node-fetch');
const googleToken = process.env.GOOGLE_API_TOKEN;

/**
 * Specifically for YouTube playback in a voice channel, this class will contain playback tools for the bot playing YouTube videos
 */
class YouTube extends Queue {
	constructor(guild) {
		super(guild);
	}

	/**
	 * A collection of guilds who own this YouTube instance.
	 */
	static activeGuilds = new Map();

	/**
	 * Validate a YouTube URL for playpack
	 * @param {string} url YouTube URL to validate
	 */
	static valudateURL(url) {
		return ytdl.validateURL(url);
	}

	/**
	 * Search YouTube for videos
	 * @param {string} search Your search term
	 * @param {integer} results How many results?
	 */
	search(search, results = 1) {
		if (!googleToken) return Promise.reject(false);
		return fetch(`https://youtube.googleapis.com/youtube/v3/search?maxResults=${results}&q=${encodeURIComponent(search)}&type=video&key=${googleToken}`).then(resp => resp.json());
	}

	/**
	 * Return a new YouTube instance for a guild. Will create a new YouTube instance for the guild if one does not already exist.
	 * @param {Message} msg
	 * @returns {YouTube, boolean}
	 */
	static init(msg) {
		try {
			if (!this.activeGuilds.has(msg.guild.id)) {
				this.activeGuilds.set(msg.guild.id, new YouTube(msg.guild.id));
			}
			return this.activeGuilds.get(msg.guild.id);
		} catch (error) {
			console.log('Unable to initialise or retrieve an existing queue for this guild.', error);
			return false;
		}
	}

	/**
	 * Execute a sub command
	 * @param {string} command What action would you like to perform?
	 */
	do(msg, command) {
		try {
			const [cmd, ...args] = command;
			if (this[`_${cmd}`][0] === 'command') this[`_${cmd}`][1](msg, args);
		} catch (error) {
			console.log(error);
			msg.reply('Unknown YouTube command.');
		}
	}

	/**
	 * Play some music! Will invoke itself recursively if the queue has items in it.
	 * @param {VoiceChannel} channel Which voice channel to join to play the music in
	 */
	async play(channel) {
		try {
			// Initiate a connection
			const connection = await channel.join();
			// Get the next item in the queue. If this is the first time playing something it will start at the first item in the queue.
			const mediaUrl = this.next.url;
			// Did the queue resolve an item? If not cancel the operation and make the bot leave the channel.
			if (!mediaUrl) {
				setTimeout(() => channel.leave(), 2000);
				return;
			}
			// Else, play something!
			const stream = await ytdl(mediaUrl);
			const dispatcher = connection.play(stream, {type: 'opus'});
			dispatcher.on('finish', () => this.play(channel));
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Play something in a voice channel
	 */
	_play = [
		'command',
		async (msg, args) => {
			try {
				// User's voice channel - required as the bot will not know which channel to join otherwise
				const voiceChannel = msg.member.voice.channel;

				if (!voiceChannel) {
					msg.reply('You are not in a voice channel.');
					return;
				}

				// If user used a video URL to add to the playlist
				// this.add() will reject with a value of false if the video does not have a valid URL.
				const addedVideo = await this.add[args[0]];

				// However, if the user still provided some parameters it is now assumed the user was trying to search
				if (!addedVideo && args.length) {
					// Contact the YouTube API for a search result
					const result = await this.search(args.join(' '));
					// Construct a video URL to stream
					const finalUrl = `https://www.youtube.com/watch?v=${result.items[0]?.id.videoId}`;
					// Add the video URL to the queue
					const addedVideoViaSearch = await this.add(msg.author, finalUrl);
					// Inform the user the operation was successful!
					msg.reply(`**Now playing:** ${addedVideoViaSearch.all.title}!`);
				}

				// Initiate the play method which will automatically work out the queue and will return false if failed
				if (this.queue.length) this.play(voiceChannel);
			} catch {
				// If it was false then the queue was probably empty meaning the above statements failed to add an item to the queue
				msg.reply('I am unable to play that YouTube video or there was not a valid YouTube video in the queue!');
			}
		}
	];

	/**
	 * Add items to the queue
	 */
	_add = [
		'command',
		async (msg, args) => {
			try {
				// Is the user trying to add an item via URL or search term?
				if (!ytdl.validateURL(args[0])) {
					// Fetch the videos via YouTube's API
					const result = await this.search(args.join(' '));
					// Construct a URL to stream from
					const finalUrl = `https://www.youtube.com/watch?v=${result.items[0]?.id.videoId}`;
					// Add the video to a queue
					const addedVideo = await this.add(msg.author, finalUrl);
					// Inform the user the item was added to the queue!
					msg.reply(`**Added:** ${addedVideo?.all.title} **to the queue!**`);
				} else {
					// If the user tried to add the video simply by a URL then just try to add it and see if it was successful!
					const addedVideo = await this.add(msg.author, args[0]);
					// Inform the user if it was successful
					if (addedVideo) msg.reply(`**Added:** ${addedVideo.all.title} **to the queue!**`);
					else msg.reply('Could not add video to queue. Is it private?');
				}
			} catch {
				// Inform the user the video was not added to the queue.
				msg.reply('Failed to add video to the queue. It may already be in the queue or the video could not be resolved.');
			}
		}
	];

	/**
	 * Skip the playing item
	 */
	_skip = [
		'command',
		msg => {
			if (this.queue.length && msg.member.voice.channel) this.play(msg.member.voice.channel);
			else if (!msg.member.voice.channel && this.queue.length) msg.reply('Join the voice channel I am in and try again.');
			else msg.reply('Could not skip! Queue us empty.');
		}
	];

	/**
	 * Make the bot leave the voice channel.
	 */
	_leave = [
		'command',
		msg => {
			try {
				const voiceChannel = msg.member.voice.channel;
				voiceChannel.leave();
			} catch (error) {
				msg.reply('Join the channel I am in and try again.');
			}
		}
	];

	/**
	 * Reply to the user with the current queue
	 * TODO: Paginate this
	 */
	_getqueue = [
		'command',
		msg => {
			// Each item is an instance of YouTubeVideo
			const videos = this?.queue.slice(0, 20);
			// Turn the list of queue items into a numbered list to be displayed as a message
			// Returns a string ready to be added to a Discord Message
			const queueItemsResp = videos => videos.map((video, index) => `**${index + 1}:** ${video?.all.title}, **added by:** <@${video?.owner.id}>`).join('\n');
			// When all videos have resolved their data then we can process that data into a message as a reply to the user
			msg.reply(videos.length ? `Displaying up to the next 20 items in the queue:\n${queueItemsResp(videos)}` : 'The queue is empty!');
		}
	];

	/**
	 * Show the user how many items are in the queue.
	 */
	_queuelength = ['command', msg => msg.reply(`**Your queue length is:** ${this?.queue.length}`)];

	/**
	 * Convert a YouTube playlist into a queue!
	 * Warning: Will overwrite the existing playlist
	 */
	_playlist = [
		'command',
		async (msg, args) => {
			try {
				// At the moment the user has to find the playlist on YouTube and get the key from the URL
				const playlistKey = args[0];
				// Contact the YouTube API and fetch the videos in that playlist
				const response = await fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistKey}&key=${googleToken}`);
				const json = await response.json();
				// Now convert the response into a simple list of video id's
				const playlistItems = json.items.map(videoResource => videoResource.snippet.resourceId.videoId);
				// Now take each video ID and try to add it to the queue
				playlistItems.forEach(playlistItem => this.add(msg.author, `https://www.youtube.com/watch?v=${playlistItem}`));
				// If all is good inform the user all videos were added to the queue!
				msg.reply('Added that playlist to the queue!');
			} catch {
				msg.reply('Unable to fetch the playlist!');
			}
		}
	];

	/**
	 * Clear the queue
	 */
	_clear = [
		'command',
		msg => {
			msg.reply('Your queue is now empty.');
			this.clear();
		}
	];

	/**
	 * Remove an item from the queue using an index
	 */
	_remove = [
		'command',
		(msg, args) => {
			// Get the proper index of the queue item. As the users reference items from index 1, we need to start at index 0
			const index = parseInt(args[0]) - 1;
			// Get the title of the video being removed
			const title = this.queueItem(index).all?.title;
			// Remove and notify
			if (this.remove(index) && index <= this.queue?.length) msg.reply(`**Removed:** ${title}`);
			else msg.reply('Could not remove the item.');
		}
	];

	/**
	 * Help the user
	 * TODO: Add code here
	 */
	_help = [
		'command',
		() => {
			console.log('Would provide some help.');
		}
	];
}

module.exports = YouTube;
