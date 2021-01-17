const fetch = require('node-fetch');
const requireAsString = require('../functions/requireAsString');
const cheerio = require('cheerio');
const sharp = require('sharp');
const {MessageAttachment} = require('discord.js');

class rs {
	static name = 'rs';

	/**
	 * Process the API data into a valid and readable JS object
	 * Please note that this function is VERY specific to how the text should be input!
	 * @param {string} data The textual data separated by commas and new lines
	 * @returns {Object} {skill: {level: int}}
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
						level: Math.abs(skill[1])
					};
					return acc;
				}, {});
			return organised;
		} catch {
			console.log('There was an error parsing the hiscores string data.');
		}
	};

	/**
	 * Take a nice preformatted SVG and inject values into it
	 * @param {string} SVGFileLocation
	 * @param {object} values Specify an object. Keys = SVG IDs, values = what to replace that ID with. Keys are found in the "skill_order" variable above
	 * @returns {string} SVG XML contents
	 */
	static injectIntoSVG = (SVGFileLocation, values) => {
		const SVGSource = requireAsString(SVGFileLocation);
		const $ = cheerio.load(SVGSource);
		Object.entries(values).forEach(value => $(`#${value[0]}`).text(value[1].level));
		return $('body').html();
	};

	/**
	 * Convert the SVG string to a buffer! Does not support embedded rasterised images. Please use a background image and overlay the SVG.
	 * @param {string} svgSource <svg>...</svg> element as a string. NOT buffer.
	 * @param {string} backgroundPath path/to/background/image.png
	 * @returns {Buffer} SVG buffer
	 */
	static SVGToImg = (svgSource, backgroundPath) => {
		return new Promise(async (resolve, reject) => {
			const svg = Buffer.from(svgSource);

			// Make the SVG an image
			const svgOverlay = await sharp(svg)
				.png()
				.toBuffer()
				.catch(error => {
					reject(error);
					return;
				});

			// Overlay the SVG over a background PNG
			const buffer = await sharp(`${__dirname}/${backgroundPath}`)
				.composite([{input: svgOverlay}])
				.toBuffer()
				.catch(error => {
					reject(error);
					return;
				});

			resolve(buffer);
		});
	};

	static execute = async (msg, args) => {
		try {
			// As runescape supports playernames with spaces, it is safe to assume that any arguments form a single player name.
			const player = args.join(' ').substring(0, 12);
			// Get player stats from a non-json API
			const api = await fetch(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${player}`);
			// Get player stats as text
			const data = await api.text();
			// Turn the jibberish API response into a nice object
			const orderedStats = this.processText(data);
			// Inject the values into an SVG, return the SVG as string
			const svgSource = this.injectIntoSVG('../images/rs_stats/style_1.svg', orderedStats);
			// Turn string-based SVG into a buffer object ready to be sent as a PNG file attachment in discord
			const imageBuffer = await this.SVGToImg(svgSource, '../images/rs_stats/background.png');
			// Send the message
			msg.reply(`Stats for RuneScape player "**${player}**":\n`, new MessageAttachment(imageBuffer));
		} catch (error) {
			console.log(error);
			msg.reply('There was a problem fetching OSRS stats. There is a current bug with the Cheerio library for Node that is causing this issue.');
		}
	};
}

module.exports = rs;
