# tpr-project

## Bots

Make sure you have npm and Node.js installed.
```bash
$ sudo apt update
$ sudo apt install nodejs npm
```

To run the Twitter bot or the commander, you have to first create a .env file inside the folder `/bot` with the following content:

```bash
# bot auth
BOT_EMAIL="bot_twitter_email"
BOT_PASSWORD="bot_twitter_password"
BOT_VERIFICATION="bot_account_phone_or_username"

# commander auth
COMMANDER_EMAIL="commander_twitter_email"
COMMANDER_PASSWORD="commander_twitter_password"
COMMANDER_VERIFICATION="commander_account_phone_or_username"

# browser (not needed for deployment with Docker)
BROWSER="/path/to/chrome/executable" # for puppeteer
HEADLESS=false # whether to run the browser in headless mode or not

# twitter topic
TOPIC="tenhoemmimtodosossonhosdomundo"
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
./bot.sh
```

or

```bash
$ cd bot
$ npm install
$ node src/bot.js
```

The same goes for the Commander (*commander.sh*), except using Docker, because it is meant to be run locally and interactively.