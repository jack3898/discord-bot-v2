const fetch = require('node-fetch');

class ud {
	static name = 'ud';
	static execute = async (event, cmd, args) => {
		try {
			const api = await fetch(`http://api.urbandictionary.com/v0/define?term=${args.join(' ')}`);
			const json = await api.json();

			// Get the definition, strip out the square brackets and make sure it meets Discord's sub-2000 letter limit
			const definition = json.list[0].definition.replace(/[\[\]']+/g, '').substring(0, 1950);

			event.reply(definition);
		} catch {
			event.reply('Hmmm... Idk what that definition is.');
		}
	};
}

module.exports = ud;
