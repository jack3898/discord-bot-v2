const fs = require('fs');
const commandModules = fs.readdirSync(__dirname + './../commands/').filter(file => file.endsWith('.js'));

// When bot is ready
function onReady() {
	if (!!commandModules.length) {
		bot.commands = new Discord.Collection(
			commandModules.map(moduleName => {
				const module = require(__dirname + './../commands/' + moduleName);
				if (module.execute && module.name) return [module.name, module];
			})
		);
	} else console.log('No commands found!');

	console.log(`Bot logged in as ${bot.user.username}.`);
}

module.exports = onReady;
