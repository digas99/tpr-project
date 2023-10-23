module.exports = {
	getTimelinePost: async (page, index) => {
		const postSelector = `div[aria-label='Timeline: Your Home Timeline'] div[data-testid='cellInnerDiv']:nth-child(${index}) article[data-testid='tweet']`;
		await page.waitForSelector(postSelector);
		console.log(`Found post ${index}`);
		return await page.$(postSelector);
	},
	likePost: async (post) => {
		const likeButton = await post.$("div[data-testid='like']");
		await likeButton.click();
		console.log("Liked post!");
	},
	dislikePost: async (post) => {
		const dislikeButton = await post.$("div[data-testid='unlike']");
		await dislikeButton.click();
		console.log("Disliked post!");
	},
	makePost: async (page, text) => {
		const textSelector = "div[data-testid='tweetTextarea_0']";
		await page.waitForSelector(textSelector);
		await page.focus(textSelector);
		await page.keyboard.type(text);
		
		const postButton = await page.$("div[data-testid='tweetButtonInline']");
		await postButton.click();
		console.log("Created Post!");
		console.log(`Text: ${text}`);
	}
}