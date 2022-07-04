require('dotenv').config();

const tmi = require('tmi.js');

const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);//
const UserList = [];
const LeftUserList = [];

let queueViewMsg = "The queue : ";
let livePlayer = "Live Players : ";
let nextPlayer = "You're up next! @";

var str;
let user;

let firstInQueueFlag = 0;
let secondInQueueFlag = 0;

let numPlayersLive = 3;

let estPlayerTime = 0;
let estPlayerMin = 0;
let estPlayerHour = 0;

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

	    if (UserList.length < numPlayersLive){
			UserList.push(player);
			client.say(channel, `@${tags.username} joined the queue and you get to play right away! Yay!`);
		}else if (UserList.length < numPlayersLive+1) {
			UserList.push(player);
			client.say(channel, `${tags.username} joined the queue and you're up next!`);
		} else{
			
			for (let i = numPlayersLive+1; i < UserList.length; i++){
				if (player.points > UserList[i].points){
					UserList.splice(i, 0, player);
					estPlayerTime = (i-numPlayersLive) * 20;
					if (estPlayerTime < 60){
						client.say(channel, `${tags.username} joined the queue! You have about ${estPlayerTime} minutes until you're up!`);
					} else if (estPlayerTime === 60){
						client.say(channel, `${tags.username} joined the queue! You have about an hour until you're up!`);
					} else if (estPlayerTime > 60){
						estPlayerHour = (estPlayerTime / 60).toFixed;
						estPlayerMin = estPlayerTime - (estPlayerHour * 60);
						client.say(channel, `${tags.username} joined the queue! You have about ${estPlayerHour} hours and ${estPlayerMin} minutes until you're up!`);
					}else{
						client.say(channel, `${tags.username} joined the queue! You are in the days wait time FUCKIN RIP, you should probably just leave`);
					}
					return;
				}	
			}
			UserList.push(player);
			estPlayerTime = ((UserList.length)-numPlayersLive) * 20;
			client.say(channel, `${tags.username} joined the queue! You have about ${estPlayerTime} minutes until you're up!`);
		}
	    
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
				if (UserList.length === 0){
					firstInQueueFlag = 0;
					secondInQueueFlag = 0;
				} else if (UserList.length === 1){
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
			UserList.length = 0;

			firstInQueueFlag = 0;
			secondInQueueFlag = 0;
			numPlayersLive = 3;

			client.say(channel, "Queue cleared.");
		}else if (tags.badges.hasOwnProperty('broadcaster')) {
			client.say(channel, "Get yo bitch ass outta here. You ain't a mod... Oh it's Kevin... Awks.. Okay sorry queue is cleared.");
		} else{
			client.say(channel, "Get yo bitch ass outta here. You ain't a mod.");
		}
		
	} else if (command === 'position'){
		for(let i = 0; i < UserList.length; i++){
			user = tags.username.toString();
			if (UserList[i].username === user){
				client.say(channel, `@${tags.username} your position in queue is : ${i+1}`);
				return;
			}
		}
		client.say(channel, `@${tags.username} Homie, you ain't in queue.`);
	} else if (command === 'next'){
		if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
			if (UserList.length < numPlayersLive+1) {
				client.say(channel, "Nah, you good to keep playing.");
				return;
			}
			for (let i = 0; i < numPlayersLive; i++){
				UserList[i].points = UserList[i].points - 1;
			}

			player.username = UserList[0].username;
			player.points = UserList[0].points;

			UserList.shift();		

			user = UserList[0].username;
			for (let i = 1; i < numPlayersLive; i++){
				user = user.concat(", ", UserList[i].username);	
			}
			str = livePlayer.concat(user.toString());
			client.say(channel, str);

			for (let i = 4; i < UserList.length; i++){
				if (player.points > UserList[i].points){
					UserList.splice(i, 0, player);
					user = UserList[numPlayersLive].username;
					str = nextPlayer.concat(user.toString());
					client.say(channel, str);
					return;
				}	
			}
			UserList.push(player);
			user = UserList[numPlayersLive].username;
			str = nextPlayer.concat(user.toString());
			client.say(channel, str);
		}
	} else if (command === 'customs'){
		numPlayersLive = 4;
		client.say(channel, "Queue now in customs games mode");
	} else if (command === 'normal'){
		numPlayersLive = 3;
		client.say(channel, "Queue now in live games mode");
	} else if (command === 'est' || command === 'estimate' || command === 'time'){
		for (let i = 0; i < UserList.length; i++){
			if (player.username > UserList[i].username){
				if (i < numPlayersLive+1){
					client.say(channel, `@${tags.username} Umm you're current playing weirdo`);
					return;
				}else if (i < numPlayersLive+2) {
					client.say(channel, `@${tags.username} You're up next! Yay!`);
					return;
				} else{
					estPlayerTime = (i-numPlayersLive) * 20;
					client.say(channel, `@${tags.username} You have about ${estPlayerTime} minutes until you're up!`);
					return;
				}
			}	
		}
		client.say(channel, `@${tags.username} You have about infinity minutes until you're up cause you ain't in queue weirdo.`);
		
	}
});
