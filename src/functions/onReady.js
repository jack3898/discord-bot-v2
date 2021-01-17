const getFiles = require('./getFiles');

// When bot is ready
function onReady() {
	const commandModules = getFiles('./../commands');

	try {
		if (!!commandModules.length) {
			bot.commands = new Discord.Collection(
				commandModules.map(moduleName => {
					const module = require(__dirname + './../commands/' + moduleName);
					if (module.execute && module.name) return [module.name, module];
				})
			);
		} else console.log('No commands found!');
	} catch (error) {
		console.log('Problem collecting commands.', error);
	}

	console.log(`Bot logged in as ${bot.user.username}.`);
	bot.user.setActivity(`${new Date().getFullYear()} get worse.`, {type: 'WATCHING'});
}

module.exports = onReady;
