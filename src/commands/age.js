const getUser = require('./../functions/getUser');

class age {
	/**
	 * This command will tell the user how old their or someone else's Discord account is as a reply in the channel they sent the message in.
	 * @param {Message} msg
	 * @param {string} cmd
	 * @param {array} args
	 */
	static execute = async (msg, args) => {
		try {
			// Is the sender trying to find the age of themself (no args) or others (args[0] being user ID)?
			const user = args.length ? await getUser(msg.guild, args[0]) : msg.author;
			// Create a new Date instance with the UNIX timestamp
			const created = new Date(user.createdTimestamp);
			// Get today's time
			const today = new Date();
			// Calculate how many days the user has had Discord
			const age = today.getTime() - created.getTime();
			// Construct and reply with the user's age!
			msg.reply(`\n**Account:** ${user ? user.username : msg.author.username}\n**Created on:** ${created.toDateString()}.\n**Age:** ${Math.round(age / 86400000)} days.`);
		} catch (error) {
			console.log(error);
			msg.reply('For some reason I am unable to find the age of that user.');
		}
	};
}

module.exports = age;
