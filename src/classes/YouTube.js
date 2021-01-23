const Queue = require('./Queue');
const ytdl = require('ytdl-core');

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
		const [cmd, ...args] = command;
		if (this[`_${cmd}`][0] === 'command') this[`_${cmd}`][1](msg, args);
		else msg.reply('Unknown YouTube command.');
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
		(msg, args) => {
			const voiceChannel = msg.member.voice.channel;

			if (!voiceChannel) msg.reply('You are not in a voice channel.');
			else {
				if (ytdl.validateURL(args[0])) this.add(args[0]);
				if (this.queue.length) this.play(voiceChannel);
				else msg.reply('Was unable to play that YouTube video and there was not a valid YouTube video in the queue!');
			}
		}
	];

	/**
	 * Add items to the queue
	 */
	_add = [
		'command',
		(msg, args) => {
			msg.delete();
			if (!ytdl.validateURL(args[0])) msg.reply('Invalid URL!');
			else {
				this.add(args[0]).title.then(title => msg.reply(`Adding **${title}** to the queue...`));
			}
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
			Promise.all(this.queue.slice(0, 26).map(item => item.all)).then(data => {
				msg.reply(data.length ? 'Displaying up to the next 25 items in the queue:\n' + data.map((item, index) => `**${index + 1}. ${item.title}** - by ${item.author_name}`).join('\n') : 'The queue is empty!');
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
