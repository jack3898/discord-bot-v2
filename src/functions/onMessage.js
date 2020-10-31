const {PREFIX} = require('./../config.json');

function onMessage(msg) {
	// Check the message being sent is either 1) not a bot and 2) starts with the prefix.
	if (msg.author.bot || !msg.content.startsWith(PREFIX)) return;

	// Split the user's message into a workable array
	const [cmd, ...args] = msg.content.trim().substring(PREFIX.length).split(/\s+/);

	// Execute
	try {
		bot.commands.get(cmd).execute(msg, cmd, args);
	} catch {
		msg.reply('Command unknown.');
	}
}

module.exports = onMessage;
