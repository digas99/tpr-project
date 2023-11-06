const puppeteer = require('puppeteer');
const utils = require('../utils/utils.js');
const log = require('../utils/utils.js').log;
const MESSAGES = require('../config/messages.js');
const QUERIES = require('../config/queries.js');

module.exports = {
	login: async (user, pass, verification, url, executable, headless=false) => {
		const options = {
			headless: headless,
			executablePath: executable,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		}

		log(MESSAGES.BROWSER);
		const browser = await puppeteer.launch(options);

		const page = await browser.newPage();
		await page.goto(url, {waitUntil: 'networkidle2'});

		// fill in username
		const loginSelector = QUERIES.LOGIN_INPUT;
		await page.waitForSelector(loginSelector);
		log(MESSAGES.USERNAME);
		await page.type(loginSelector, user);

		// click button next
		let nextButton;
		nextButton = await utils.getElementByInnerText(page, QUERIES.LOGIN_BUTTON, "Next");
		await nextButton.click();
		
		log(MESSAGES.PASSWORD);

		// wait for next step to load
		await page.waitForSelector("div[aria-labelledby='modal-header']");

		// fill in password
		const passwordSelector = QUERIES.LOGIN_PASSWORD;
		const passwordInput = await page.$(passwordSelector);
		if (!passwordInput) {
			log(MESSAGES.VERIFICATION_NEEDED);
			
			// fill twitter's unusual activity phone/username verification
			const verificationSelector = QUERIES.LOGIN_VERIFICATION;
			await page.waitForSelector(verificationSelector);
			log(MESSAGES.VERIFICATION);
			await page.type(verificationSelector, verification);
			nextButton = await utils.getElementByInnerText(page, QUERIES.LOGIN_BUTTON, "Next");
			await nextButton.click();
		}	

		await page.waitForSelector(passwordSelector);
		log(MESSAGES.PASSWORD);
		await page.type(passwordSelector, pass);

		// click button login
		const loginButton = await utils.getElementByInnerText(page, QUERIES.LOGIN_BUTTON, "Log in");
		await loginButton.click();

		// wait for page to load
		await page.waitForNavigation();

		log(MESSAGES.LOGIN);

		return page;
	},
	acceptCookies: async (page) => {
		const acceptCookiesSelector = QUERIES.COOKIES_WRAPPER;
		const acceptCookiesButton = await page.$(acceptCookiesSelector);
		if (acceptCookiesButton) {
			await acceptCookiesButton.click();
		} 
		
		log(MESSAGES.COOKIES);
	}
}