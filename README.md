# tpr-project

This project provides two bots, a **Bot** and a **Commander**, that use **Twitter as a communication channel** to send and receive messages between them. The **Bot** runs on an infected computer and the **Commander** runs and is controlled by the attacker. The attacker sends commands through the Commander to the Bot, which executes them in the victims device and sends back the results.

All the communication done through the posts is encrypted (except for the topic name and type of post identifier). Take the following post as an example:

```
COMMAND: 29099ca3dc33ec964c592e7aa8f0eafab885d77db35dd098f290f7494b464403 [8155] #tenhoemmimtodosossonhosdomundo
```

Through AI, we detect the Bot's behavior etc (**COMPLETE**)

## Table of Contents

1. [Bot](#bot)
2. [Difficulty](#difficulty)
	1. [Dumb](#dumb)
	2. [Regular](#regular)
	3. [Advanced](#advanced)
2. [Commander](#commander)
3. [Setup](#setup)
    1. [Docker](#docker)
	2. [Node.js](#nodejs)


## Bot

The Bot is a Node.js application that runs on the victim's computer.

Upon login, the Bot will go to its Twitter designed topic (hastag) and posts saying that the communication channel is open.

The Bot will then wait for commands from the Commander. They are a post on that same topic that begin with the keyword `COMMAND:`.

When the Bot detects a command, it will execute it and post back the result on the same topic. The post will begin with the keyword `OUTPUT:`.

Because Twitter posts have a limit of 280 characters, the Bot will split the output in multiple posts if necessary.

This process of sending back the result always end with a header post, that begins with the keyword `HEADER:`, and informs the Commander how many posts it should fetch to get the full output.

An example of a full output is the following:

```
HEADER: ae633baea1c9f31306efbde7951b94282049069a683a5ff08a8f57113227c3ea [2293] #tenhoemmimtodosossonhosdomundo

OUTPUT: bc3d189c7c5acffeed02f3c67d69c464e11b7d4dafe1e78a317553e9541ca8c1dab889778e0516765f6c067ec4cb5002 [1928] #tenhoemmimtodosossonhosdomundo

OUTPUT: 66af5fad6b432572f5c04d60a06eec150fa7438c4536c1914b071b599aec6f87fa090242c2cd1f81c4888964c138542d2f36da00f00a02436e657de60c594922c2a617187d584bec3fe013153a541464 [1336] #tenhoemmimtodosossonhosdomundo
```

Here, after decrypting, the header should indicate the Commander that there are two posts to fetch with content from the result of the command execution by the Bot.

Finally, the Bot will wait for the next command. This process consists of reloading the page every predefined amount of time and checking if there are new posts.

## Difficulty

The Bot has three difficulty levels in terms of how it behaves, which increases the difficulty of detecting it. All three difficulties have the same functionality.

### Dumb

**Fixed waits**

The Dumb Bot makes it easier to detect because it will always poll the page for new posts with a fixed interval, creating a pattern that can be easily detected. The act of posting back the result is also done with the same fixed interval, even between parts of the same output.

### Regular

**Random waits**

The Regular Bot behaves similarly to the Dumb Bot, but it will randomize the interval between polls and between posts of the same output. This will right away eliminate the patterns.

### Advanced

**Random waits followed by bursts**

The Advanced Bot tries to mimic a human user (in a very basic way). It will still poll the page for new posts (with a randomized interval, like the Regular Bot) but the posts with the result of the command execution are done in a burst, where the time between each post that is part of the same output is very small (but still randomized), unlike the Dumb and Regular Bots that keep the same timing approach between posts of the same output as they do with the periodic polling to the web page.

### Commander

The Commander is a Node.js application that runs on the attacker's computer.

Upon login, the Commander will go to the Bot's designed topic (hastag) and checks if the Bot is active.

If the Bot is active, the attacker is given the possibility to input a command to be executed by the Bot. The Bot will execute the command within this project's ```/bot``` directory. On the Commander's terminal, the following prompt will appear:

```
bot@whatevertopic:~$
```

The Commander will then post the command on the Bot's topic, as follows:

```
COMMAND: 29099ca3dc33ec964c592e7aa8f0eafab885d77db35dd098f290f7494b464403 [8155] #tenhoemmimtodosossonhosdomundo
```

The Commander will then poll the page for new posts and check if the Bot has posted back the result of the command execution. It will be looking for a post that begins with the keyword `HEADER:`. This post should indicate the Commander how many posts it should fetch to get the full output. An example of a full output is the following:

```
HEADER: ae633baea1c9f31306efbde7951b94282049069a683a5ff08a8f57113227c3ea [2293] #tenhoemmimtodosossonhosdomundo

OUTPUT: bc3d189c7c5acffeed02f3c67d69c464e11b7d4dafe1e78a317553e9541ca8c1dab889778e0516765f6c067ec4cb5002 [1928] #tenhoemmimtodosossonhosdomundo

OUTPUT: 66af5fad6b432572f5c04d60a06eec150fa7438c4536c1914b071b599aec6f87fa090242c2cd1f81c4888964c138542d2f36da00f00a02436e657de60c594922c2a617187d584bec3fe013153a541464 [1336] #tenhoemmimtodosossonhosdomundo
```

With the information on how many posts to fetch, the Commander will decrypt the content of those with the keyword `OUTPUT:`, aggregate the result and print it on the terminal, as follows:

```
bot@whatevertopic:~$ ls

# some logs indicating that the Commander is waiting for the Bot to post back the result... #

config
Dockerfile
node_modules
package.json
package-lock.json
src
utils
```

After the result is printed, a new prompt will appear, indicating that the Commander is ready to send a new command.

## Setup

Make sure you have npm and Node.js installed.
```bash
$ sudo apt update
$ sudo apt install nodejs npm
```

To run the Bot or the Commander, you have to first create a .env file inside the folder `/bot` with the following content:

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

# posts configuration
CONTENT_ENCRYPTION_SECRET="some_secret" # secret used to encrypt the content of the messages
PLACEHOLDER_IMAGES_API="api_url_endpoint" # API used to get placeholder images
```

Then, you can setup and run the Bot either with Docker or with Node.js.

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

The same goes for the Commander (*commander.sh*), except using Docker, because it is meant to be run interactively.


To run the main script:

```bash
$ python3 ProfileClass.py
```
