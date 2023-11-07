require('dotenv').config();
const path = require('path');
const readline = require('readline');

const { login, acceptCookies } = require('./lib/login.js');
const Commands = require('./lib/commands.js');
const { log, sleep } = require('../utils/utils.js');
const { URLS, COMMANDS, COMMUNICATION } = require('../config/constants.js');
const MESSAGES = require('../config/messages.js');

const read = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

USER = process.env.COMMANDER_EMAIL;
PASS = process.env.COMMANDER_PASSWORD;
VERIFICATION = process.env.COMMANDER_VERIFICATION;
BROWSER = process.env.BROWSER;
HEADLESS = process.env.HEADLESS == "true" ? "new" : false;
TOPIC = process.env.TOPIC;

const nextAction = () => {
	log(MESSAGES.EMPTY);
	sleep(COMMANDS.DELAY);
}

const checkCommunicationChannel = async (commands, topic) => {
	commands.page.goto(`${URLS.TOPIC.format(topic)}?f=live`, {waitUntil: 'networkidle2'});

	// within this hashtag page, check if the bot has opened a session
	const latest = await commands.getTimelinePost(1);
	let content = await commands.getPostContent(latest);

	// remove topic hashtag from content
	content = content.replace(`#${topic}`, "").trim();

	// check if bot closed session
	return content != COMMUNICATION.CLOSE;
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

	// check communication channel state
	const comm_state_check = setInterval(async () => {
		const comm_state = await checkCommunicationChannel(commands, TOPIC);
		if (comm_state) {
			log(MESSAGES.COMMUNICATION_OPEN.format(TOPIC));
			clearInterval(comm_state_check);

			// user prompt in terminal
			read.question(MESSAGES.COMMAND_PROMPT.format(TOPIC.slice(0, 8)+"..."), async command => {
				read.close();

				// build tweet
				const timestmap = Date.now();
				command = "COMMAND: " + command.trim() + ` [${timestmap}]`;			

				// send command to communication channel
				await commands.makePost(command, [`#${TOPIC}`]);

				// check communication channel until bot executes command
				const output_check = setInterval(async () => {
					commands.page.goto(`${URLS.TOPIC.format(TOPIC)}?f=live`, {waitUntil: 'networkidle2'});

					const latest = await commands.getTimelinePost(1);
					let content = await commands.getPostContent(latest);

					// remove topic hashtag from content
					content = content.replace(`#${TOPIC}`, "").trim();

					// check if tweet is a command
					if (content.startsWith("OUTPUT:")) {
						clearInterval(output_check);

						// remove output tag from content
						content = content.replace("OUTPUT:", "").trim();

						// remove timestamp from content
						content = content.split("[")[0].trim();

						// log output
						console.log(content);
					}
				}, 5000);
			});
		}
		else {
			log(MESSAGES.COMMUNICATION_CLOSED.format(TOPIC));
		}
	}, 5000);
})();