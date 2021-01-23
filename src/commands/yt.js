const ytdl = require('ytdl-core');
const Queue = require('./../classes/Queue');

class yt {
	static name = 'yt';

	// Which guilds need a queue
	static activeGuilds = new Map();

	static async execute(msg, args) {
		const voiceChannel = msg.member.voice.channel;
		// Initialise the queue for the guild

		// Is the user in a voice channel?
		if (!voiceChannel) {
			msg.reply('You need to be in a voice channel.');
			return;
		}

		// The Message instance is used to identify the guild and create a queue specific to that guild
		const currentQueue = this.initQueue(msg);

		// Process any sub-commands of this command
		if (ytdl.validateURL(args[0])) {
			currentQueue.add(args[0]);
		} else if (args[0] === 'add') {
			if (ytdl.validateURL(args[1])) currentQueue.add(args[1]);
			else msg.reply('That URL is not valid.');
			return;
		} else if (args[0] === 'leave') {
			voiceChannel.leave();
			return;
		} else if (args[0] === 'queue') {
			msg.reply(
				currentQueue.queue.length
					? 'The next 5 items in the queue:\n' +
							currentQueue.queue
								.slice(0, 6)
								.map(item => `*${item}*`)
								.join('\n')
					: 'The queue is empty!'
			);
			return;
		} else if (args[0] === 'clear') {
			currentQueue.clear();
		} else if (args[0] === 'help') {
			msg.reply('You can try:\n1. *[url]*, play a YouTube URL\n2. *add [url]*, add a YouTube URL to the queue. You can do this even while the bot is playing something and it will play is as soon as it is finished with the current item.\n3. *leave*, make the bot leave the voice channel\n4. *queue*, get the queue');
			return;
		}

		this.play(currentQueue, voiceChannel);
	}

	/**
	 * Return a new Queue instance for a guild. Will create a new Queue for the guild if one does not already exist.
	 * @param {Message} msg
	 * @returns {Queue, boolean}
	 */
	static initQueue(msg) {
		try {
			if (!this.activeGuilds.has(msg.guild.id)) {
				this.activeGuilds.set(msg.guild.id, new Queue(msg.guild.id));
			}
			return this.activeGuilds.get(msg.guild.id);
		} catch (error) {
			console.log('Unable to initialise or retrieve an existing queue for this guild.', error);
			return false;
		}
	}

	/**
	 * Play a YouTube video in a Discord Channel utilising a queue.
	 * It will invoke itself recursively if the queue has the items to do so.
	 * @param {Queue} currentQueue a Queue() instance
	 * @param {VoiceChannel} voiceChannel a VoiceChannel instance
	 */
	static async play(currentQueue, voiceChannel) {
		try {
			currentQueue.connect(voiceChannel, connection => {
				const mediaUrl = currentQueue.next;

				if (!mediaUrl) {
					setTimeout(() => voiceChannel.leave(), 2000);
					return;
				}

				const stream = ytdl(mediaUrl, {quality: 'highestaudio', filter: 'audioonly'});
				const dispatcher = connection.play(stream);
				dispatcher.on('finish', () => this.play(currentQueue, voiceChannel));
			});
		} catch (error) {
			console.log('Unable to play the videos.', error);
			return false;
		}
	}
}

module.exports = yt;
