const ytdl = require('ytdl-core');

class yt {
	static name = 'yt';

	static execute = async (msg, args) => {
		const voiceChannel = msg.member.voice.channel;
		try {
			if (!voiceChannel) {
				msg.reply('You need to be in a voice channel.');
				return;
			} else if (args[0] === 'leave') {
				voiceChannel.leave();
				return;
			}

			const connection = await voiceChannel.join();
			const stream = ytdl(args[0], {quality: 'highestaudio', filter: 'audioonly'});
			const dispatcher = connection.play(stream);
			dispatcher.on('speaking', speaking => (!speaking ? voiceChannel.leave() : null));
		} catch (error) {
			msg.reply('Unable to play the video.');
			voiceChannel.leave();
			console.log(error);
		}
	};
}

module.exports = yt;
