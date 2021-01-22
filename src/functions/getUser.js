/**
 * Resolve a GuildMember via the user's ID.
 * @param {Guild} guild The guild to search in
 * @param {string} userID The user's numerical ID
 * @returns {Promise | false} GuildMember Promise is resolved
 */
async function getUser(guild, userID) {
	try {
		// For some reason, if the line below is not present, the user variable has a high liklihood to turn out undefined. It might temporarily populate the cache?
		await guild.members.fetch(userID);
		const user = guild.members.cache.get(userID).user;
		return Promise.resolve(user);
	} catch {
		return Promise.reject(false);
	}
}

module.exports = getUser;
