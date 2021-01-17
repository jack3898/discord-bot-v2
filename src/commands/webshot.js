const {MessageAttachment} = require('discord.js');
const puppeteer = require('puppeteer');

class yt {
	static name = 'webshot';

	static execute = async (msg, args) => {
		try {
			// Params
			const url = args[0].startsWith('https://') ? args[0] : `https://${args[0]}`;
			const width = args[1] ? Math.abs(args[1]) : 1366;
			const height = args[2] ? Math.abs(args[2]) : 768;

			// Catch that the uer has entered in a viewport that is too large
			if (width > 10000 || height > 10000) {
				msg.reply('That image is wayyy too big soz.');
				return;
			}

			// Run browser and take screenshot
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.setViewport({width: width, height: height});
			await page.waitForTimeout(5000);
			await page.goto(url);
			const png = await page.screenshot({type: 'png'});
			msg.reply('Here is your screenshot: ', new MessageAttachment(png));
			await browser.close();
		} catch (error) {
			msg.reply('Unable to load the site.');
			console.log(error);
		}
	};
}

module.exports = yt;
