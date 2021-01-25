// Constructors
global.Discord = require('discord.js');
global.rootPath = __dirname;

// Instances
global.bot = new Discord.Client();
const onReady = require('./functions/onReady');
const onCommand = require('./functions/onCommand');

// Events
bot.on('ready', onReady);
bot.on('message', onCommand);
bot.login();
