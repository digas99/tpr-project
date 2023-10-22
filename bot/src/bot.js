require('dotenv').config();
const { login } = require('./login.js');

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
	console.log("Logged in successfully!");
})();