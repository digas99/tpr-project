const puppeteer = require('puppeteer');
const utils = require('../utils/utils.js');
const log = require('../utils/utils.js').log;

module.exports = {
	login: async (user, pass, verification, url, executable, headless=false) => {
		const options = {
			headless: headless,
			executablePath: executable,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		}

		log("Launching browser...");
		const browser = await puppeteer.launch(options);

		const page = await browser.newPage();
		await page.goto(url, {waitUntil: 'networkidle2'});

		// fill in username
		const loginSelector = "input[autocomplete='username']";
		await page.waitForSelector(loginSelector);
		log("Filling in username...");
		await page.type(loginSelector, user);

		// click button next
		let nextButton;
		nextButton = await utils.getElementByInnerText(page, "div[role='button'] div[dir='ltr']", "Next");
		await nextButton.click();
		
		log("Filling in password...");

		// wait for next step to load
		await page.waitForSelector("div[aria-labelledby='modal-header']");

		// fill in password
		const passwordSelector = "input[autocomplete='current-password']";
		const passwordInput = await page.$(passwordSelector);
		if (!passwordInput) {
			log("Password input not found, checking for verification...");
			
			// fill twitter's unusual activity phone/username verification
			const verificationSelector = "input[data-testid='ocfEnterTextTextInput']";
			await page.waitForSelector(verificationSelector);
			log("Filling in verification text...");
			await page.type(verificationSelector, verification);
			nextButton = await utils.getElementByInnerText(page, "div[role='button'] div[dir='ltr']", "Next");
			await nextButton.click();
		}	

		await page.waitForSelector(passwordSelector);
		log("Filling in password...");
		await page.type(passwordSelector, pass);

		// click button login
		const loginButton = await utils.getElementByInnerText(page, "div[role='button'] div[dir='ltr']", "Log in");
		await loginButton.click();

		// wait for page to load
		await page.waitForNavigation();

		log("Logged in successfully!");

		return page;
	},
	acceptCookies: async (page) => {
		const acceptCookiesSelector = "div[data-testid='BottomBar'] div[role='button']";
		const acceptCookiesButton = await page.$(acceptCookiesSelector);
		if (acceptCookiesButton) {
			await acceptCookiesButton.click();
		} 
		
		log("Accepted cookies!");
	}
}