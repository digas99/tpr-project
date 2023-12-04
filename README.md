# tpr-project

## Bot

Make sure you have npm and Node.js installed.
```bash
$ sudo apt update
$ sudo apt install nodejs npm
```

To run the Twitter bot, you have to first create a .env file inside the folder `/bot` with the following content:

```bash
# auth
EMAIL="your_twitter_email"
PASSWORD="your_twitter_password"
VERIFICATION="account_phone_or_username" # account's phone number or username

# browser (not needed for deployment with Docker)
BROWSER="/path/to/chrome/executable" # for puppeteer
HEADLESS=false # whether to run the browser in headless mode or not
```

Then, you can setup and run the bot either with Docker or with Node.js.

### Docker

```bash
$ cd bot
$ docker build --tag tpr-bot .
$ docker run --name tpr-bot tpr-bot
```

### Node.js

```bash
chmod +x bot.sh
./bot.sh [difficulty]	# difficulty [0, 1, 2], default is 0
```

or

```bash
$ cd bot
$ npm install
$ node src/bot.js
```