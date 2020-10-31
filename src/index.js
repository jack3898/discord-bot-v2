// Constructors
global.Discord = require('discord.js');

// Instances
global.bot = new Discord.Client();
const onReady = require('./functions/onReady');
const onMessage = require('./functions/onMessage');

// Events
bot.on('ready', onReady);
bot.on('message', onMessage);
bot.login();
