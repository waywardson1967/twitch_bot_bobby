require('dotenv').config();

const tmi = require('tmi.js');

const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);//
const UserList = [];

let queueViewMsg = "The queue : ";
let livePlayer = "Live Players : ";
let nextPlayer = "You're up next! @";

var str;
let user;

let firstInQueueFlag = 0;
let secondInQueueFlag = 0;

let numPlayersLive = 0;

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
	const player = {
	username : "waywardson__",
	points : "0"
	};
    const isNotBot = tags.username.toLowerCase() !== process.env.TWITCH_BOT_USERNAME;
    
    if (!isNotBot) return;
	if(message.charAt(0) != "!") return;

    const [raw, command, argument] = message.match(regexpCommand);	

    if (command === 'join'){
	    user = tags.username.toString();
	    /*for (let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
		    	client.say(channel, `${tags.username} is already in the queue!`);
				return;
			}
	    }*/
	    player.username = tags.username.toString();
	    
	    if (firstInQueueFlag === 0){
			player.points = 2;
		    firstInQueueFlag = 1;
	    }else if (secondInQueueFlag === 0){
		    player.points = 1;
		    secondInQueueFlag = 1;
	    }else
	    {
			player.points = 0;
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
	    
		if(UserList.length < 5){
			UserList.push(player);
		} else{
			for (let i = 4; i < UserList.length; i++){
				if (player.points > UserList[i].points){
					UserList.splice(i, 0, player);
					client.say(channel, `${tags.username} joined the queue!`);
					return;
				}	
			}
			UserList.push(player);
			client.say(channel, `${tags.username} joined the queue!`);
		}

	    
	    client.say(channel, `${tags.username} joined the queue!`);
	    
    } else if (command === 'queue' || command === 'q' || command === 'list'){
        if (UserList.length === 0){
            client.say(channel, 'The queue is empty.');		
        }else
        {
			user = UserList[0].username;
			for (let i = 1; i < UserList.length; i++){
				user = user.concat(", ", UserList[i].username);	
			}
	    	str = queueViewMsg.concat(user.toString());
			client.say(channel, str);
        }
    } else if (command === 'leave'){
		user = tags.username.toString();
		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				UserList.splice(i,1);
				client.say(channel, `${tags.username} has left the queue!`);
				if (UserList.length = 0){
					firstInQueueFlag = 0;
					secondInQueueFlag = 0;
				} else if (UserList.length = 1){
					secondInQueueFlag = 0;
				}
				return;
			}
		}
	    client.say(channel, `@${tags.username} - This dumbass thinks they are in the queue. LOL idiot.`);
    } else if (command === 'point'){
		user = tags.username.toString();
		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				client.say(channel, `@${tags.username} your point allocation is : ${UserList[i].points}`);
				return;
			}
		}
		
		client.say(channel, `umm @${tags.username} you aren't in queue... awks...`);
	} else if (command === 'clear' ){
		if (tags.badges.hasOwnProperty('moderator')) {
			while (UserList.length != 0){
				UserList.pop();
			}
			firstInQueueFlag = 0;
			secondInQueueFlag = 0;
			numPlayersLive = 3;
			client.say(channel, "Queue reset.");
		} else{
			client.say(channel, "Get yo bitch ass outta here. You ain't a mod.");
		}
		
	} else if (command === 'position'){
		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				client.say(channel, `@${tags.username} your position in queue is : ${i+1}`);
				return;
			}
		}
		client.say(channel, `@${tags.username} Homie, you ain't in queue.`);
	} else if (command === 'next'){
		UserList[0].points = UserList[0].points - 1;
		UserList[1].points = UserList[1].points - 1;
		UserList[2].points = UserList[2].points - 1;

		player.username = UserList[0].username;
		player.points = UserList[0].points;

		UserList.shift();

		user = UserList[0].username;
		for (let i = 1; i < numPlayersLive; i++){
			user = user.concat(", ", UserList[i].username);	
		}
		str = livePlayer.concat(user.toString());
		client.say(channel, str);

		user = UserList[(numPlayersLive + 1)].username;
		str.nextPlayer.concat(user.toString());
		client.say(channel, str);

		for (let i = 4; i < UserList.length; i++){
			if (player.points > UserList[i].points){
				UserList.splice(i, 0, player);
				return;
			}	
		}
		UserList.push(player);

	} else if (command === 'customs'){
		numPlayersLive = 4;
	} else if (command === 'normal'){
		numPlayersLive = 3;
	}
});
