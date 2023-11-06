require('dotenv').config();
const { login, acceptCookies } = require('./login.js');
const Commands = require('./commands.js');
const { log, sleep } = require('../utils/utils.js');
const { URLS, COMMANDS } = require('../config/constants.js');
const MESSAGES = require('../config/messages.js');

USER = process.env.EMAIL;
PASS = process.env.PASSWORD;
VERIFICATION = process.env.VERIFICATION;
BROWSER = process.env.BROWSER;
HEADLESS = process.env.HEADLESS == "true" ? "new" : false;

const nextAction = () => {
	log(MESSAGES.EMPTY);
	sleep(COMMANDS.DELAY);
}

// run bot
(async () => {
	log(MESSAGES.STARTING);

	const page = await login(USER, PASS, VERIFICATION, URLS.LOGIN, BROWSER, HEADLESS);
	nextAction();
	await acceptCookies(page);
	nextAction();

	const commands = new Commands(page);

	await commands.sendMessage("diogopowerlol", "Message 1");
	nextAction();
	await commands.sendMessage("diogopowerlol", "Message 2");
})();