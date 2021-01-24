const Queue = require('./Queue');
const YouTubeVideo = require('./YouTubeVideo');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');
const {APIMessage} = require('discord.js');
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
		} catch {
			msg.reply('Unknown YouTube command.');
		}
	}

	/**
	 * Play some music! Will invoke itself recursively if the queue has items in it.
	 * @param {VoiceChannel} channel Which voice channel to join to play the music in
	 */
	play(channel) {
		this.connect(channel, connection => {
			const mediaUrl = this.next.url;

			if (!mediaUrl) {
				setTimeout(() => channel.leave(), 2000);
				return;
			}

			const stream = ytdl(mediaUrl, {quality: 'highestaudio', filter: 'audioonly'});
			const dispatcher = connection.play(stream);
			dispatcher.on('finish', () => this.play(channel));
		});
	}

	/**
	 * Play something in a voice channel
	 */
	_play = [
		'command',
		async (msg, args) => {
			const voiceChannel = msg.member.voice.channel;

			if (!voiceChannel) msg.reply('You are not in a voice channel.');
			else {
				// If user used a video URL to add to the playlist
				const addedVideo = await this.add[args[0]];
				if (addedVideo);
				else if (args.length) {
					// If not then did the user add a search term instead?
					const result = await this.search(args.join(' '));
					const finalUrl = `https://www.youtube.com/watch?v=${result.items[0]?.id.videoId}`;
					await this.add(finalUrl)
						.then(addedVideoViaSearch => {
							msg.reply(`**Now playing:** ${addedVideoViaSearch.all.title}!`);
						})
						.catch(() => {
							// Ignore
						});
				}
				// Initiate the play method which will automatically work out the queue and will return false if failed
				if (this.queue.length) this.play(voiceChannel);
				// If it was false then the queue was probably empty meaning the above statements failed to add an item to the queue
				else msg.reply('I am unable to play that YouTube video or there was not a valid YouTube video in the queue!');
			}
		}
	];

	/**
	 * Add items to the queue
	 */
	_add = [
		'command',
		async (msg, args) => {
			// Is the user trying to add an item via URL or search term?
			if (!ytdl.validateURL(args[0])) {
				// Fetch the videos via YouTube's API
				const result = await this.search(args.join(' ')).catch(() => {
					msg.reply("Failed to find the video in YouTube's API.");
				});

				// Construct a URL
				const finalUrl = `https://www.youtube.com/watch?v=${result.items[0]?.id.videoId}`;

				// Add the video
				const addedVideo = await this.add(finalUrl).catch(() => {
					msg.reply('Failed to add video. Does it exist?');
				});

				// Send the user a message to say the video was added!
				msg.reply(`**Added:** ${addedVideo.all.title} **to the queue!**`).catch(() => {
					msg.reply('I cannot find that video.');
				});
			} else {
				// If the user tried to add the video simply by a URL then just try to add it and see if it was successful!
				this.add(args[0])
					.then(addedVideo => {
						if (addedVideo) msg.reply(`**Added:** ${addedVideo.all.title} **to the queue!**`);
						else msg.reply('Could not add video to queue.');
					})
					.catch(() => {
						msg.reply('Failed to add that video to the queue.');
					});
			}
		}
	];

	/**
	 * Skip the playing item
	 */
	_skip = [
		'command',
		msg => {
			if (this.queue.length) this.play(msg.member.voice.channel);
			else msg.reply('Nothing to skip or you are at the end of the queue!');
		}
	];

	/**
	 * Make the bot leave the voice channel.
	 */
	_leave = [
		'command',
		msg => {
			const voiceChannel = msg.member.voice.channel;

			try {
				voiceChannel.leave();
			} catch (error) {
				console.log(error);
			}
		}
	];

	/**
	 * Reply to the user with the current queue
	 */
	_getqueue = [
		'command',
		msg => {
			// Each item is an instance of YouTubeVideo
			const videos = this.queue.slice(0, 20);

			// Turn the list of queue items into a numbered list to be displayed as a message
			// Returns a string ready to be added to a Discord Message
			const queueItemsResp = videos => videos.map((video, index) => `**${index + 1}:** ${video.all.title}`).join('\n');

			// When all videos have resolved their data then we can process that data into a message as a reply to the user
			msg.reply(videos.length ? `Displaying up to the next 20 items in the queue:\n${queueItemsResp(videos)}` : 'The queue is empty!');
		}
	];

	_queuelength = [
		'command',
		msg => {
			msg.reply(`**Your queue length is:** ${this.queue.length}`);
		}
	];

	/**
	 * Convert a YouTube playlist into a queue!
	 * Warning: Will overwrite the existing playlist
	 */
	_playlist = [
		'command',
		(msg, args) => {
			const playlistKey = args[0];

			fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=20&playlistId=${playlistKey}&key=${googleToken}`)
				.then(resp => resp.json())
				.then(json => {
					const playlistItems = json.items.map(videoResource => videoResource.snippet.resourceId.videoId);

					playlistItems.forEach(playlistItem => {
						const videoUrl = `https://www.youtube.com/watch?v=${playlistItem}`;
						this.add(videoUrl);
					});

					msg.reply('Added that playlist to the queue!');
				})
				.catch(() => {
					msg.reply('Unable to fetch the playlist!');
				});
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
