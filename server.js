require('dotenv').config();

const tmi = require('tmi.js');

const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
let UserList = [];
var numOfPeopleInList = 0;

let queueViewMsg = "The queue : ";
var str;
let user;

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
        
	
    if (command === 'join'){
	user = tags.username;
	    UserList.push(user.toString());
	client.say(channel, `${tags.username} joined the queue!`);
	    numOfPeopleInList++;
	    
    } else if (command === 'queue'){
        if (numOfPeopleInList === 0){
            client.say(channel, 'The queue is empty.');		
        }else
        {
		user = UserList[0];
	    str = queueViewMsg.concat(user.toString());
            client.say(channel, 'The queue is NOT empty.');
		client.say(channel, str);
        }
    }
});
