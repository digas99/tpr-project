const { URLS } = require('../../config/constants.js');
const log = require('../../utils/utils.js').log;
const MESSAGES = require('../../config/messages.js');
const QUERIES = require('../../config/queries.js');

class Commands {
	constructor(page) {
		this.page = page;
	}

	async getTimelinePost(index) {
		const postSelector = QUERIES.POST_WRAPPER.format(index);
		await this.page.waitForSelector(postSelector);
		return await this.page.$(postSelector);
	}

	async getPostContent(post) {
		const postTextElem = await post.$(QUERIES.POST_TEXT);
		if (postTextElem)
			return await postTextElem.evaluate(node => node.innerText);
		else
			return "";
	}

	async likePost(post) {
		const likeButton = await post.$(QUERIES.POST_LIKE);
		await likeButton.click();
		log(MESSAGES.POST_LIKED);
	}

	async dislikePost(post) {
		const dislikeButton = await post.$(QUERIES.POST_DISLIKE);
		await dislikeButton.click();
		log(MESSAGES.POST_DISLIKED);
	}

	async makePost(text, hashtags=[]) {
		this.redirect(URLS.HOME);

		const textSelector = QUERIES.TEXT_AREA;
		text += hashtags.length > 0 ? ` ${hashtags.join(" ")}` : "";
		await this.writeText(this.page, textSelector, text+" ");

		const postButton = await this.page.$(QUERIES.POST_BUTTON);
		await postButton.click();
		
		log(MESSAGES.POST_CREATED);
		log(MESSAGES.MESSAGE_CONTENT.format(text));
	}

	async commentPost(post, text) {
		const textSelector = QUERIES.TEXT_AREA;
		await this.writeText(post, textSelector, text);

		const postButton = await post.$(QUERIES.POST_COMMENT_BUTTON);
		await postButton.click();

		log(MESSAGES.POST_CREATED);
		log(MESSAGES.MESSAGE_CONTENT.format(text));
	}

	async sendMessage(user, text) {
		const redirected = await this.redirect(URLS.DIRECT, false);

		// if redirected, click on user
		if (redirected) {
			// click on a user to open chat
			const usersSelector = QUERIES.MESSAGE_USER;
			await this.page.waitForSelector(usersSelector);

			const clickedUserTab = await this.page.$$eval(usersSelector, (users, user, query) => {
				const result = users.find(userElem => userElem.querySelector(`a[href='/${user}']`));
				if (result) {
					const conversation = result.querySelector(query);
					conversation.click();
				}
	
				return result !== undefined;
			}, user, QUERIES.MESSAGE_CONVERSATION);
	
			if (!clickedUserTab) {
				log(MESSAGES.NO_USER.format(user));
				return;
			}
		}

		// write message
		const textSelector = QUERIES.MESSAGE_TEXT_AREA;
		await this.writeText(this.page, textSelector, text);

		// wait for the text to be written
		await this.page.waitForFunction((textSelector, expectedText) => {
			const element = document.querySelector(textSelector);
			return element && element.textContent.trim() === expectedText;
		}, {}, textSelector, text);

		const postButtonSelector = QUERIES.MESSAGE_SEND_BUTTON;
		await this.page.waitForSelector(postButtonSelector);
		const postButton = await this.page.$(postButtonSelector);
		await postButton.click();

		log(MESSAGES.MESSAGE_SENT.format(user));
		log(MESSAGES.MESSAGE_CONTENT.format(text));
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
			log(MESSAGES.REDIRECT.format(url));
		}
		return shouldRedirect;
	}
}

module.exports = Commands;