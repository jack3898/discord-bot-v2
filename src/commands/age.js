class age {
	/**
	 * This command will tell the user how old their or someone else's Discord account is as a reply in the channel they sent the message in.
	 * @param {Message} msg Message instance, used to identify which channel to reply in
	 * @param {array} args The name of the user. Will be joined to form a string
	 */
	static execute = async (msg, args) => {
		try {
			// Construct the query
			const options = {query: args.join(' '), force: true};
			// Wait for the script to fetch the user
			const userCollection = await msg.guild.members.fetch(options);
			// Extract the User instance from the query
			const user = Array.from(userCollection)[0][1].user;
			// Create a new Date instance with the UNIX timestamp
			const created = new Date(user.createdTimestamp);
			// Get today's time
			const today = new Date();
			// Calculate how many days the user has had Discord
			const age = today.getTime() - created.getTime();
			// Construct and reply with the user's age!
			msg.reply(`\n**Account:** ${user ? user.username : msg.author.username}\n**Created on:** ${created.toDateString()}.\n**Age:** ${Math.round(age / 86400000)} days.`);
		} catch (error) {
			msg.reply('I am unable to find that user.');
		}
	};
}

module.exports = age;
