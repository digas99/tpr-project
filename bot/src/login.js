const puppeteer = require('puppeteer');
const utils = require('../utils/utils.js');

module.exports = {
	login: async (user, pass, verification, url, executable, headless=false) => {
		const options = {
			headless: headless,
			executablePath: executable,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		}

		console.log("Launching browser...");
		const browser = await puppeteer.launch(options);

		const page = await browser.newPage();
		await page.goto(url, {waitUntil: 'networkidle2'});

		// fill in username
		const loginSelector = "input[autocomplete='username']";
		await page.waitForSelector(loginSelector);
		console.log("Filling in username...");
		await page.type(loginSelector, user);

		// click button next
		let nextButton;
		nextButton = await utils.getElementByInnerText(page, "div[role='button'] div[dir='ltr']", "Next");
		await nextButton.click();
		
		console.log("Filling in password...");

		// fill in password
		const passwordSelector = "input[autocomplete='current-password']";
		const passwordInput = await page.$(passwordSelector);
		if (!passwordInput) {
			console.log("Password input not found, checking for verification...");
			
			// fill twitter's unusual activity phone/username verification
			const verificationSelector = "input[data-testid='ocfEnterTextTextInput']";
			await page.waitForSelector(verificationSelector);
			console.log("Filling in verification text...");
			await page.type(verificationSelector, verification);
			nextButton = await utils.getElementByInnerText(page, "div[role='button'] div[dir='ltr']", "Next");
			await nextButton.click();
		}	

		await page.waitForSelector(passwordSelector);
		console.log("Filling in password...");
		await page.type(passwordSelector, pass);

		// click button login
		const loginButton = await utils.getElementByInnerText(page, "div[role='button'] div[dir='ltr']", "Log in");
		await loginButton.click();

		// wait for page to load
		await page.waitForNavigation();

		console.log("Logged in successfully!");

		return page;
	}
}