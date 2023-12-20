const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
	sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
	Difficulty: {
		Dumb: 0,
		Regular: 1,
		Advanced: 2,
	},
	downloadImage: async (url, path) => {
		// make sure that the path exists
		const dir = path.split('/').slice(0, -1).join('/');
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		// fetch the image stream
		const response = await axios({
			method: 'GET',
			url: url,
			responseType: 'stream'
		});
		// pipe the result stream into a file on disc
		response.data.pipe(fs.createWriteStream(path));
		// return a promise and resolve when download finishes
		return new Promise((resolve, reject) => {
			response.data.on('end', () => {
				resolve();
			});
			response.data.on('error', err => {
				reject(err);
			});
		});
	},
	fetchImage: async (url, targetPath) => {
		const imageURL = await fetch(url).then(res => res.url).then(url => url);
		const imagePath = path.join(__dirname, targetPath);
		await module.exports.downloadImage(imageURL, imagePath);
		return imagePath;
	}
}