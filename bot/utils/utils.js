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
	}
}