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
	    user = tags.username.toString();
	    for (let i = 0; i < UserList.length; i++){
			if (UserList[i] === user.replace(/[^a-zA-Z0-9 ]/g, '')){
		    		client.say(channel, `${tags.username} is already in the queue!`);
				return;
			}
	    }
	    
	    UserList.push(user.replace(/[^a-zA-Z0-9 ]/g, ''));
	    client.say(channel, `${tags.username} joined the queue!`);
	    numOfPeopleInList++;
	    
    } else if (command === 'queue' || command === 'q' || command === 'list'){
        if (numOfPeopleInList === 0){
            client.say(channel, 'The queue is empty.');		
        }else
        {	user = UserList[0];
		for (let i = 1; i < UserList.length; i++){
			user = user.concat(", ", UserList[i]);	
		}
		//user = UserList[0];
	    	str = queueViewMsg.concat(user.toString());
		client.say(channel, str);
        }
    } else if (command === 'leave'){
		user = tags.username.toString();
		for(let i = 0; i < UserList.length; i++){
			if (UserList[i] === user.replace(/[^a-zA-Z0-9 ]/g, '')){
				UserList.splice(i,1);
				client.say(channel, `${tags.username} has been removed from the queue!`);
				return;
			}
		}
	    	client.say(channel, `${tags.username} - This dumbass thinks they are in the queue. LOL idiot.`);
    }
});
