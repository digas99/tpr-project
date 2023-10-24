require('dotenv').config();
const { login, acceptCookies } = require('./login.js');
const Commands = require('./commands.js');
const { URLS, COMMANDS } = require('../config/constants.js');
const { log, hold } = require('../utils/utils.js');

USER = process.env.EMAIL;
PASS = process.env.PASSWORD;
VERIFICATION = process.env.VERIFICATION;
BROWSER = process.env.BROWSER;
HEADLESS = process.env.HEADLESS == "true" ? "new" : false;

const nextAction = () => {
	log("");
	hold(COMMANDS.DELAY);
}

// run bot
(async () => {
	log("Starting bot...");

	const page = await login(USER, PASS, VERIFICATION, URLS.LOGIN, BROWSER, HEADLESS);
	nextAction();
	await acceptCookies(page);
	nextAction();

	const commands = new Commands(page);

	// make post
	//const text = "Hello!";
	//commands.makePost(text);
	await commands.sendMessage("diogopowerlol", "Message 1");
	nextAction();
	await commands.sendMessage("diogopowerlol", "Message 2");
})();