# tpr-project

## Bot

To run the Twitter bot, you have to first create a .env file inside the folder `/bot` with the following content:

```bash
# auth
EMAIL="your_twitter_email"
PASSWORD="your_twitter_password"
VERIFICATION="account_phone_or_username" # account's phone number or username

# browser
BROWSER="/path/to/chrome/executable" # for puppeteer
HEADLESS=false # weather to run the browser in headless mode or not

# url
URL="https://twitter.com/i/flow/login" # twitter login page
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