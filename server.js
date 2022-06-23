require('dotenv').config();

const tmi = require('tmi.js');

const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
let UserList = [];
var numOfPeopleInList = 0;

//const str;

const commands = {
    queue : {
        response: 'The queue is empty.'
    },
    join : {
        response: (user) => `${user} joined the queue!`
    }

}

const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: process.env.TWITCH_BOT_USERNAME,
		password: process.env.TWITCH_OAUTH_TOKEN
	},
	channels: [ 'bobbysinger__' ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {

    const isNotBot = tags.username.toLowerCase() !== process.env.TWITCH_BOT_USERNAME;
    
    if (!isNotBot) return;
    
    const [raw, command, argument] = message.match(regexpCommand);
    

    const {response} = commands[command] || {};

    if (typeof response === 'function') {
        client.say(channel, response(tags.username));
    } else if (typeof response === 'string') {
        client.say(channel, response);
    }
    
	
    if (command === 'join'){
	//UserList(numOfPeopleInList++) = tags.username;
	    UserList.push("test");
	client.say(channel, command);
	    numOfPeopleInList++;
	    
    } else if (command === 'queue'){
        if (numOfPeopleInList === 0){
            client.say(channel, 'The queue is empty.');		
        }else
        {
		
	    const str = UserList.toString();
            client.say(channel, 'The queue is NOT empty.');
		//client.say(channel, str);
        }
    }
});
