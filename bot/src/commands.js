const urls = require('../config/constants.js').URLS;
const log = require('../utils/utils.js').log;

class Commands {
	constructor(page) {
		this.page = page;
	}

	async getTimelinePost(index) {
		const postSelector = `div[aria-label='Timeline: Your Home Timeline'] div[data-testid='cellInnerDiv']:nth-child(${index}) article[data-testid='tweet']`;
		await this.page.waitForSelector(postSelector);
		log(`Found post ${index}`);
		return await this.page.$(postSelector);
	}

	async likePost(post) {
		const likeButton = await post.$("div[data-testid='like']");
		await likeButton.click();
		log("Liked post!");
	}

	async dislikePost(post) {
		const dislikeButton = await post.$("div[data-testid='unlike']");
		await dislikeButton.click();
		log("Disliked post!");
	}

	async makePost(text) {
		this.redirect(urls.HOME);

		const textSelector = "div[data-testid='tweetTextarea_0']";
		await this.writeText(this.page, textSelector, text);
		
		const postButton = await this.page.$("div[data-testid='tweetButtonInline']");
		await postButton.click();
		
		log("Created Post!");
		log(`Text: ${text}`);
	}

	async commentPost(post, text) {
		const textSelector = "div[data-testid='tweetTextarea_0']";
		await this.writeText(post, textSelector, text);

		const postButton = await post.$("div[data-testid='tweetButton']");
		await postButton.click();

		log("Commented on post!");
		log(`Text: ${text}`);
	}

	async sendMessage(user, text) {
		const redirected = await this.redirect(urls.DIRECT, false);

		// if redirected, click on user
		if (redirected) {
			// click on a user to open chat
			const usersSelector = "div[data-testid='activeRoute']";
			await this.page.waitForSelector(usersSelector);

			const clickedUserTab = await this.page.$$eval(usersSelector, (users, user) => {
				const result = users.find(userElem => userElem.querySelector(`a[href='/${user}']`));
				if (result) {
					const conversation = result.querySelector("div[data-testid='conversation'] > div > div:nth-child(2)");
					conversation.click();
				}
	
				return result !== undefined;
			}, user);
	
			if (!clickedUserTab) {
				log(`User ${user} not found!`);
				return;
			}
		}

		// write message
		const textSelector = "div[data-testid='dmComposerTextInput']";
		await this.writeText(this.page, textSelector, text);

		const postButtonSelector = "div[aria-label='Send']";
		await this.page.waitForSelector(postButtonSelector);
		const postButton = await this.page.$(postButtonSelector);
		await postButton.click();

		log(`Sent message to ${user}!`);
		log(`Text: ${text}`);
	}

	async writeText(post, selector, text) {
		await post.waitForSelector(selector);
		await post.focus(selector);
		await post.keyboard.type(text);
	}

	async redirect(url, exact=true) {
		const currentUrl = await this.page.url();
		const shouldRedirect = exact && currentUrl !== url || !exact && !currentUrl.includes(url);
		if (shouldRedirect) {
			await this.page.goto(url);
			log(`Redirected to ${url}`);
		}
		return shouldRedirect;
	}
}

module.exports = Commands;