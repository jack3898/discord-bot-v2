class age {
	/**
	 * This method will tell the user how old their or someone else's Discord account is as a reply in the channel they sent the message in.
	 * @param {Message} msg
	 * @param {String} cmd
	 * @param {Array} args
	 */
	static execute = async (msg, args, cmd) => {
		try {
			let created;
			let user;

			if (!args.length) created = new Date(msg.author.createdTimestamp);
			else {
				const uid = args[0];
				// For some reason, if the line below is not present, the user variable will turn out to be undefined. It might temporarily populate the cache?
				await msg.guild.members.fetch(uid);
				user = msg.guild.members.cache.get(uid).user;
				created = new Date(user.createdTimestamp);
			}

			const today = new Date();
			const age = today.getTime() - created.getTime();
			msg.reply(`\n**Account:** ${user ? user.username : msg.author.username}\n**Created on:** ${created.toDateString()}.\n**Age:** ${Math.round(age / 86400000)} days.`);
		} catch (error) {
			msg.reply('For some reason I am unable to find the age of that user.');
		}
	};
}

module.exports = age;
