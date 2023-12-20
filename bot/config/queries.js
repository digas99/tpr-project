module.exports = {
	LOGIN_INPUT: "input[autocomplete='username']",
	LOGIN_BUTTON: "div[role='button'] div[dir='ltr']",
	LOGIN_PASSWORD: "input[autocomplete='current-password']",
	LOGIN_VERIFICATION: "input[data-testid='ocfEnterTextTextInput']",

	COOKIES_WRAPPER: "div[data-testid='BottomBar'] div[role='button']",

	POST_WRAPPER: "div[aria-label='Home timeline'] div[data-testid='cellInnerDiv']:nth-child({0}) article[data-testid='tweet']",
	POST_USER: "div[data-testid='User-Name']",
	POST_TEXT: "div[data-testid='tweetText']",
	POST_LIKE: "div[data-testid='like']",
	POST_DISLIKE: "div[data-testid='unlike']",
	POST_BUTTON: "div[data-testid='tweetButtonInline']",
	POST_COMMENT_BUTTON: "div[data-testid='tweetButton']",

	MESSAGE_USER: "div[data-testid='activeRoute']",
	MESSAGE_CONVERSATION: "div[data-testid='conversation'] > div > div:nth-child(2)",
	MESSAGE_TEXT_AREA: "div[data-testid='dmComposerTextInput']",
	MESSAGE_SEND_BUTTON: "div[aria-label='Send']",

	TEXT_AREA: "div[data-testid='tweetTextarea_0']",
	TOOL_BAR: "div[data-testid='toolBar']",

	IMAGE_INPUT: "input[data-testid='fileInput']",
}