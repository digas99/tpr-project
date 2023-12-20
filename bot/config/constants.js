module.exports = {
	URLS: {
		LOGIN: `https://twitter.com/i/flow/login`,
		HOME: `https://twitter.com/home`,
		DIRECT: `https://twitter.com/messages`,
		TOPIC: `https://twitter.com/hashtag/{0}`,

	},
	COMMANDS: {
		DELAY: 200,
	},
	COMMUNICATION: {
		OPEN: "Communication opened.",
		CLOSE: "Communication closed.",
		CHECK_INTERVAL: 20000,
		CHECK_INTERVAL_UPPER_PERCENTAGE: 0.8,
		CHECK_INTERVAL_LOWER_PERCENTAGE: 0.2,
		BURST_INTERVAL: 2000,
		BURST_INTERVAL_UPPER_PERCENTAGE: 0.5,
		BURST_INTERVAL_LOWER_PERCENTAGE: 0.5,
	},
	TWEETS: {
		MAX_CHARS: 50, // max 280 but command goes encrypted and with topic
		MAX_POSTS: 5, // max 5 posts per burst to avoid api 429 too many requests
	}
}