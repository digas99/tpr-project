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
		const textSelector = "div[data-testid='tweetTextarea_0']";
		await this.page.waitForSelector(textSelector);
		await this.page.focus(textSelector);
		await this.page.keyboard.type(text);
		
		const postButton = await this.page.$("div[data-testid='tweetButtonInline']");
		await postButton.click();
		console.log("Created Post!");
		console.log(`Text: ${text}`);
	}
}

module.exports = Commands;