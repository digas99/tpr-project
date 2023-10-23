require('dotenv').config();
const { login, acceptCookies } = require('./login.js');
const Commands = require('./commands.js');
const urls = require('../config/constants.js').URLS;
const log = require('../utils/utils.js').log;

USER = process.env.EMAIL;
PASS = process.env.PASSWORD;
VERIFICATION = process.env.VERIFICATION;
BROWSER = process.env.BROWSER;
HEADLESS = process.env.HEADLESS == "true" ? "new" : false;

// run bot
(async () => {
	log("Starting bot...");

	const page = await login(USER, PASS, VERIFICATION, urls.LOGIN, BROWSER, HEADLESS);
	log("");
	await acceptCookies(page);
	log("");

	const commands = new Commands(page);

	// make post
	//const text = "Hello!";
	//commands.makePost(text);
	await commands.sendMessage("diogopowerlol", "Message 1");
	log("");
	await commands.sendMessage("diogopowerlol", "Message 2");
})();