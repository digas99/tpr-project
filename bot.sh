#!/bin/bash

DIFFICULTY=

# check if difficulty is set
if [ -z "$1" ]
then
	DIFFICULTY=0
else
	DIFFICULTY=$1
fi

# go to bot directory
cd bot

# install dependencies
npm install

# start bot
node src/bot.js $DIFFICULTY