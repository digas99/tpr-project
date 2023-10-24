module.exports = {
	getElementByInnerText: async (page, selector, text) => {
		const elements = await page.$$(selector);
		for (let element of elements) {
			let elementText = await page.evaluate(el => el.innerText, element);
			if (elementText === text) {
				return element;
			}
		}
		return null;
	},
	log: (text) => {
		const timestamp = new Date().toLocaleString();
		console.log(`[${timestamp}] ${text}`);
	},
	hold: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
}