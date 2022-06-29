require('dotenv').config();

const tmi = require('tmi.js');

const regexpCommand = new RegExp(/*([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
const UserList = [];

let queueViewMsg = "The queue : ";
var str;
let user;

let firstInQueueFlag = 0;
let secondInQueueFlag = 0;

const player = {
	username : "waywardson__",
	points : "0",
	position : "1"
};

const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: process.env.TWITCH_BOT_USERNAME,
		password: process.env.TWITCH_OAUTH_TOKEN
	},
	channels: [ 'waywardson__' ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {

    const isNotBot = tags.username.toLowerCase() !== process.env.TWITCH_BOT_USERNAME;
    
    if (!isNotBot) return;
    client.say(channel, "This is a test");
    const [raw, command, argument] = message.match(regexpCommand);	
    client.say(channel, "This is a test");
    if (command === 'join'){
	    user = tags.username.toString();
	    for (let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
		    	client.say(channel, `${tags.username} is already in the queue!`);
				return;
			}
	    }
	    player.username = tags.username.toString();
	    
	    if (firstInQueueFlag === 0){
			player.points = 2;
		    player.position = 1;
		    firstInQueueFlag = 1;
	    }else if (secondInQueueFlag === 0){
		    player.points = 1;
		    player.position = 2;
		    secondInQueueFlag = 1;
	    }else
	    {
		player.points = 0;
		    player.position = 3;    
	    }
	    if (tags.badges.hasOwnProperty('subscriber')){
		    if (tags.badges.subscriber.toString() === "1"){
		    	player.points = player.points + 1;
		    } else if (tags.badges.subscriber.toString() === "3"){
		    	player.points = player.points + 2;
		    } else if (tags.badges.subscriber.toString() === "6"){
		    	player.points = player.points + 3;
		    } else if (tags.badges.subscriber.toString() === "9"){
		    	player.points = player.points + 4;
		    } else if (tags.badges.subscriber.toString() === "12"){
		    	player.points = player.points + 5;
		    }  
			
	    }
	    if (tags.badges.hasOwnProperty('moderator')){
			player.points = player.points + 3;
	    }else if (tags.badges.hasOwnProperty('vip')){
			player.points = player.points + 2;
	    }
	    
	    UserList.push(player);
	    client.say(channel, `${tags.username} joined the queue!`);
	    
    } else if (command === 'queue' || command === 'q' || command === 'list'){
        if (UserList.length === 0){
            client.say(channel, 'The queue is empty.');		
        }else
        {
			user = UserList[0].username;
			for (let i = 1; i < UserList.length; i++){
				user = user.concat(", ", UserList[i]);	
			}
	    	str = queueViewMsg.concat(user.toString());
			client.say(channel, str);
        }
    } else if (command === 'leave'){
		user = tags.username.toString();
		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				UserList.splice(i,1);
				client.say(channel, `${tags.username} has been removed from the queue!`);
				return;
			}
		}
	    client.say(channel, `${tags.username} - This dumbass thinks they are in the queue. LOL idiot.`);
    } else if (command === 'points'){
		user = tags.username.toString();
		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				client.say(channel, `${tags.username} your point allocation is : ${UserList[i].points}`);
				return;
			}
		}
		client.say(channel, `umm ${tags.username} you aren't in queue... awks...`);
	}
});
