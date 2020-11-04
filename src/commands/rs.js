const fetch = require('node-fetch');

class rs {
	static name = 'rs';

	/**
	 * Process the API data into a valid and readable JS object
	 * Please note that this function is VERY specific to how the text should be input!
	 * @param {string} data The textual data separated by commas and new lines
	 */
	static processText = data => {
		try {
			// As the Hiscores API is so crap, there is no key that identifies the skill
			// So, I have had to find out the order of the skills myself, put them in an array, and then map
			// the below array to that of the API.
			// Yes, this does mean that if the API changes it could fall over. Buuuut, the API is terrible so...
			const skill_order = ['total_level', 'attack', 'defence', 'strength', 'hitpoints', 'ranged', 'prayer', 'magic', 'cooking', 'woodcutting', 'fletching', 'fishing', 'firemaking', 'crafting', 'smithing', 'mining', 'herblore', 'agility', 'thieving', 'slayer', 'farming', 'runecrafting', 'hunter', 'construction'];

			const organised = data
				.split('\n')
				.map(section => section.split(','))
				.filter(stat => stat.length === 3)
				.reduce((acc, skill, index) => {
					acc[skill_order[index]] = {
						xp: Math.abs(skill[2]),
						level: Math.abs(skill[1])
					};
					return acc;
				}, {});
			return organised;
		} catch {
			console.log('There was an error parsing the hiscores string data.');
		}
	};

	static execute = async (msg, cmd, args) => {
		const api = await fetch(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${args.join(' ')}`);
		const data = await api.text();
		const orderedStats = this.processText(data);
		msg.reply(JSON.stringify(orderedStats));
	};
}

module.exports = rs;
