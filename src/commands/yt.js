const ytdl = require('ytdl-core');
const Queue = require('./../classes/Queue');

class yt {
	static name = 'yt';

	// Which guilds need a queue
	static activeGuilds = new Map();

	static async execute(msg, args) {
		try {
			const voiceChannel = msg.member.voice.channel;

			// Is the user in a voice channel?
			if (!voiceChannel) {
				msg.reply('You need to be in a voice channel.');
				return;
			} else if (args[0] === 'leave') {
				voiceChannel.leave();
				return;
			}

			// Get guild the YouTube playlist was set up in and check a queue exists
			const guild = msg.guild;
			if (!this.activeGuilds.has(guild.id)) this.activeGuilds.set(guild.id, new Queue(guild));

			// Get the queue instance for the guild
			const currentQueue = this.activeGuilds.get(guild.id);

			if (args[0] === 'add' && ytdl.validateURL(args[1])) currentQueue.add(args[1]);
			else if (args[0] === 'add') msg.reply('Invalid URL');
			else this.play(currentQueue, voiceChannel);
		} catch (error) {
			msg.reply('Unable to play the video.');
			voiceChannel.leave();
			console.log(error);
		}
	}

	static initiatePlayback() {}

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
		}
	}
}

module.exports = yt;
