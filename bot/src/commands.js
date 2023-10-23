class Commands {
	constructor(page) {
		this.page = page;
	}

	async getTimelinePost(index) {
		const postSelector = `div[aria-label='Timeline: Your Home Timeline'] div[data-testid='cellInnerDiv']:nth-child(${index}) article[data-testid='tweet']`;
		await this.page.waitForSelector(postSelector);
		console.log(`Found post ${index}`);
		return await this.page.$(postSelector);
	}

	async likePost(post) {
		const likeButton = await post.$("div[data-testid='like']");
		await likeButton.click();
		console.log("Liked post!");
	}

	async dislikePost(post) {
		const dislikeButton = await post.$("div[data-testid='unlike']");
		await dislikeButton.click();
		console.log("Disliked post!");
	}

	async makePost(text) {
		this.redirect("https://twitter.com/home");

		const textSelector = "div[data-testid='tweetTextarea_0']";
		await this.writeText(this.page, textSelector, text);
		
		const postButton = await this.page.$("div[data-testid='tweetButtonInline']");
		await postButton.click();
		
		console.log("Created Post!");
		console.log(`Text: ${text}`);
	}

	async commentPost(post, text) {
		const textSelector = "div[data-testid='tweetTextarea_0']";
		await this.writeText(post, textSelector, text);

		const postButton = await post.$("div[data-testid='tweetButton']");
		await postButton.click();

		console.log("Commented on post!");
		console.log(`Text: ${text}`);
	}

	async sendMessage(user, text) {
		this.redirect("https://twitter.com/messages", false);

		// click on a user to open chat
		const usersSelector = "div[data-testid='activeRoute']";
		await this.page.waitForSelector(usersSelector);

		const clickedUserTab = await this.page.$$eval(usersSelector, (users, user) => {
			console.log(users, user);
			const result = users.find(userElem => userElem.querySelector(`a[href='/${user}']`));
			console.log(result);
			if (result) {
				const conversation = result.querySelector("div[data-testid='conversation'] > div > div:nth-child(2)");
				conversation.click();
			}

			return result !== undefined;
		}, user);

		if (!clickedUserTab) {
			console.log(`User ${user} not found!`);
			return;
		}

		// write message
		const textSelector = "div[data-testid='dmComposerTextInput']";
		await this.writeText(this.page, textSelector, text);

		const postButtonSelector = "div[aria-label='Send']";
		const postButton = await this.page.$(postButtonSelector);
		await postButton.click();

		console.log(`Sent message to ${user}!`);
		console.log(`Text: ${text}`);
	}

	async writeText(post, selector, text) {
		await post.waitForSelector(selector);
		await post.focus(selector);
		await post.keyboard.type(text);
	}

	async redirect(url, exact=true) {
		const currentUrl = await this.page.url();
		const goto = exact && currentUrl !== url || !exact && !currentUrl.includes(url);
		if (goto) {
			await this.page.goto(url);
			await this.page.waitForNavigation();
			console.log(`Redirected to ${url}`);
		}
	}
}

module.exports = Commands;