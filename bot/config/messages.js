module.exports = {
	STARTING: "Starting bot...",
	BROWSER: "Launching browser...",
	EMPTY: "",

	// LOGIN
	USERNAME: "Filling in username...",
	PASSWORD: "Filling in password...",
	VERIFICATION_NEEDED: "Password input not found, checking for verification...",
	VERIFICATION: "Filling in verification text...",
	LOGIN: "Logged in successfully!",

	COOKIES: "Accepted cookies.",

	NO_USER: "User {0} not found!",
	REDIRECT: "Redirected to {0}...",
	
	MESSAGE_SENT: "Sent message to {0}!",
	MESSAGE_CONTENT: "Text: {0}",
	
	// POSTS
	POST_FOUND: "Found post {0}",
	POST_LIKED: "Liked post!",
	POST_DISLIKED: "Disliked post!",
	POST_COMMENTED: "Commented on post!",
	POST_CREATED: "Created post!",
}

// https://stackoverflow.com/a/4673436/11488921
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
		});
	};
}