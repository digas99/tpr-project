require('dotenv').config();
const { login, acceptCookies } = require('./login.js');
const Commands = require('./commands.js');

USER = process.env.EMAIL;
PASS = process.env.PASSWORD;
VERIFICATION = process.env.VERIFICATION;
BROWSER = process.env.BROWSER;
HEADLESS = process.env.HEADLESS == "true" ? "new" : false;
LOGIN_URL = process.env.URL;

// run bot
(async () => {
	console.log("Starting bot...");

	const page = await login(USER, PASS, VERIFICATION, LOGIN_URL, BROWSER, HEADLESS);
	await acceptCookies(page);

	const commands = new Commands(page);

	// make post
	//const text = "Hello!";
	//commands.makePost(text);
	const message = "Mensagem";
	commands.sendMessage("diogopowerlol", message);
})();