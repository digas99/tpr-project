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

const attachToCommunicationChannel = async (commands, topic, callback) => {
	commands.page.goto(`${URLS.TOPIC.format(topic)}?f=live`, {waitUntil: 'networkidle2'});

	// within this hashtag page, check if the bot has opened a session
	const latest = await commands.getTimelinePost(1);
	if (!latest) {
		attachToCommunicationChannel(commands, topic, callback);
		return;
	}

	let content = await commands.getPostContent(latest);
	console.log(content);
	// remove topic hashtag from content
	content = content.replace(`#${topic}`, "").trim();

	// check if bot closed session
	if (content != COMMUNICATION.CLOSE && callback) {
		log(MESSAGES.COMMUNICATION_OPEN.format(topic));
		await callback();
	}
	else {
		log(MESSAGES.COMMUNICATION_CLOSED.format(topic));
	}

	setTimeout(() => attachToCommunicationChannel(commands, topic, callback), COMMUNICATION.CHECK_INTERVAL);
}

const executeCommand = async (commands, topic) => {
	// user prompt in terminal
	const command = await new Promise((resolve) => {
		read.question(MESSAGES.COMMAND_PROMPT.format(topic.slice(0, 12)+"..."), async command => {
			// read.close();

			// build tweet
			const timestmap = Date.now();
			command = "COMMAND: " + command.trim() + ` [${timestmap}]`;		
			
			// send command to communication channel
			await commands.makePost(command, [`#${topic}`]);
			resolve(command);
		});
	});

	const output = await fetchOutput(commands, topic);
	if (output) {
	  console.log(output);
	}
}

const fetchOutput = async (commands, topic) => {
    let content;
    
    while (true) {
        await commands.page.goto(`${URLS.TOPIC.format(topic)}?f=live`, { waitUntil: 'networkidle2' });

        const latest = await commands.getTimelinePost(1);

        if (latest) {
            content = await commands.getPostContent(latest);

            // Remove topic hashtag from content
            content = content.replace(`#${topic}`, "").trim();

            // Check if the tweet is a command
            if (content.startsWith("OUTPUT:")) {
                content = content.replace("OUTPUT:", "").trim();
                content = content.split("[")[0].trim();
                break; // Exit the loop when the condition is met
            } else {
                console.log(MESSAGES.COMMAND_OUTPUT_WAITING);
                await new Promise(resolve => setTimeout(resolve, COMMUNICATION.CHECK_INTERVAL));
            }
        } else {
            console.log(MESSAGES.COMMAND_OUTPUT_WAITING);
            await new Promise(resolve => setTimeout(resolve, COMMUNICATION.CHECK_INTERVAL));
        }
    }

    return content;
}

// run bot
(async () => {
	log(MESSAGES.STARTING.format(path.basename(__filename).replace(".js", "")));

	const page = await login(USER, PASS, VERIFICATION, URLS.LOGIN, BROWSER, HEADLESS);
	nextAction();
	await acceptCookies(page);
	nextAction();

	const commands = new Commands(page);

	attachToCommunicationChannel(commands, TOPIC, async () => {
		await executeCommand(commands, TOPIC);
	});
})();