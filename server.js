require('dotenv').config();

const tmi = require('tmi.js');

const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);//
const UserList = [];
const LeftUserList = [];
let AlreadyJoined = 0;

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

let JoinedMessage = " joined ";

const argumentWords = [];

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

    if (command === 'join' || command ==='add'){
	    
	    /*for (let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
		    	client.say(channel, `${tags.username} is already in the queue!`);
				return;
			}
	    }*/

		AlreadyJoined = 0;
		if (command === 'add'){
			if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
				if (argument == null){
					client.say(channel, "Silly mod, you need to say WHO you want to add.");
					return;
				}
				argumentWords = argument.split(/[, ]+/);
				for (let i = 0; i < argumentWords.length; i++){
					client.say(channel, argumentWords[i].toString());
				}
				if (argumentWords.length > 1){
					client.say(channel, "Silly mod, that's not a valid name.");
					return;
				}
				user = argument.toString();
				JoinedMessage = " was added to ";
			}else{
				return;
			}
		} else{
			user = tags.username.toString();
			JoinedMessage = " joined ";
		}

		for (let i = 0; i < LeftUserList.length; i++){
			if (LeftUserList[i].username === user){
				AlreadyJoined = 1;
				player.username = LeftUserList[i].username;
				player.points = LeftUserList[i].points;
				JoinedMessage = " rejoined ";
				LeftUserList.splice(i,1);
				break;
			}
		}

		if (AlreadyJoined === 0){
			player.username = user;
	    
			if (firstInQueueFlag === 0){
				player.points = 3;
				firstInQueueFlag = 1;
			}else if (secondInQueueFlag === 0){
				player.points = 2;
				secondInQueueFlag = 1;
			}else
			{
				player.points = 0;
			}
			if (command === 'join'){
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
			}
		}
	    

	    if (UserList.length < numPlayersLive){
			UserList.push(player);
			client.say(channel, `@${user} ${JoinedMessage} the queue and you get to play right away! Yay!`);
		}else if (UserList.length < numPlayersLive+1) {
			UserList.push(player);
			client.say(channel, `${user} ${JoinedMessage} the queue and you're up next!`);
		} else{
			
			for (let i = numPlayersLive+1; i < UserList.length; i++){
				if (player.points > UserList[i].points){
					UserList.splice(i, 0, player);
					estPlayerTime = (i-numPlayersLive) * 20;
					if (estPlayerTime< 60){
						client.say(channel, `${user} ${JoinedMessage} the queue! You have about ${estPlayerTime} minutes until you're up!`);
					} else if (estPlayerTime === 60){
						client.say(channel, `${user} ${JoinedMessage} the queue! You have about an hour until you're up!`);
					} else if (estPlayerTime < 120){
						estPlayerHour = ~~(estPlayerTime / 60);
						estPlayerMin = estPlayerTime - (estPlayerHour * 60);
						if (estPlayerMin === 0){
							client.say(channel, `${user} ${JoinedMessage} the queue! You have about ${estPlayerHour} hour until you're up!`);
						}else{
							client.say(channel, `${user} ${JoinedMessage} the queue! You have about ${estPlayerHour} hour and ${estPlayerMin} minutes until you're up!`);
						}
					}
					else if (estPlayerTime < (24*60)){
						estPlayerHour = ~~(estPlayerTime / 60);
						estPlayerMin = estPlayerTime - (estPlayerHour * 60);
						if (estPlayerMin === 0){
							client.say(channel, `${user} ${JoinedMessage} the queue! You have about ${estPlayerHour} hours until you're up!`);
						}else{
							client.say(channel, `${user} ${JoinedMessage} the queue! You have about ${estPlayerHour} hours and ${estPlayerMin} minutes until you're up!`);
						}
					}else{
						client.say(channel, `${user} ${JoinedMessage} the queue! You are in the days wait time FUCKIN RIP, you should probably just leave`);
					}
					return;
				}	
			}
			UserList.push(player);
			estPlayerTime = ((UserList.length)-numPlayersLive) * 20;
			if (estPlayerTime< 60){
				client.say(channel, `${user} ${JoinedMessage} the queue! You have about ${estPlayerTime} minutes until you're up!`);
			} else if (estPlayerTime === 60){
				client.say(channel, `${user} ${JoinedMessage} the queue! You have about an hour until you're up!`);
			} else if (estPlayerTime < 120){
				estPlayerHour = ~~(estPlayerTime / 60);
				estPlayerMin = estPlayerTime - (estPlayerHour * 60);
				if (estPlayerMin === 0){
					client.say(channel, `${user} ${JoinedMessage} the queue! You have about ${estPlayerHour} hour until you're up!`);
				}else{
					client.say(channel, `${user} ${JoinedMessage} the queue! You have about ${estPlayerHour} hour and ${estPlayerMin} minutes until you're up!`);
				}
			}
			else if (estPlayerTime < (24*60)){
				estPlayerHour = ~~(estPlayerTime / 60);
				estPlayerMin = estPlayerTime - (estPlayerHour * 60);
				if (estPlayerMin === 0){
					client.say(channel, `${user} ${JoinedMessage} the queue! You have about ${estPlayerHour} hours until you're up!`);
				}else{
					client.say(channel, `${user} ${JoinedMessage} the queue! You have about ${estPlayerHour} hours and ${estPlayerMin} minutes until you're up!`);
				}
			}else{
				client.say(channel, `${user} ${JoinedMessage} the queue! You are in the days wait time FUCKIN RIP, you should probably just leave`);
			}
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
				player.username = UserList[i].username;
				player.points = UserList[i].points;

				LeftUserList.push(player);

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
		/*user = tags.username.toString();
		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				client.say(channel, `@${tags.username} your point allocation is : ${UserList[i].points}`);
				return;
			}
		}
		
		client.say(channel, `umm @${tags.username} you aren't in queue... awks...`);*/

		for(let i = 0; i < UserList.length; i++){
			client.say(channel, `@${UserList[i].username} your point allocation is : ${UserList[i].points}`);
		}

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
		
	} else if (command === 'position' || command === 'pos'){
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
				if (UserList[i].points > 0){
					UserList[i].points = UserList[i].points - 1;
				}
				
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

			for (let i = numPlayersLive; i < UserList.length; i++){
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
		if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
			numPlayersLive = 4;
			client.say(channel, "Queue now in customs games mode");
		}
	} else if (command === 'normal'){
		if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
			numPlayersLive = 3;
			client.say(channel, "Queue now in live games mode");
		}
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
					if (estPlayerTime< 60){
						client.say(channel, `${tags.username} ${JoinedMessage} the queue! You have about ${estPlayerTime} minutes until you're up!`);
					} else if (estPlayerTime === 60){
						client.say(channel, `${tags.username} ${JoinedMessage} the queue! You have about an hour until you're up!`);
					} else if (estPlayerTime < 120){
						estPlayerHour = ~~(estPlayerTime / 60);
						estPlayerMin = estPlayerTime - (estPlayerHour * 60);
						if (estPlayerMin === 0){
							client.say(channel, `${tags.username} ${JoinedMessage} the queue! You have about ${estPlayerHour} hour until you're up!`);
						}else{
							client.say(channel, `${tags.username} ${JoinedMessage} the queue! You have about ${estPlayerHour} hour and ${estPlayerMin} minutes until you're up!`);
						}
					}
					else if (estPlayerTime < (24*60)){
						estPlayerHour = ~~(estPlayerTime / 60);
						estPlayerMin = estPlayerTime - (estPlayerHour * 60);
						if (estPlayerMin === 0){
							client.say(channel, `${tags.username} ${JoinedMessage} the queue! You have about ${estPlayerHour} hours until you're up!`);
						}else{
							client.say(channel, `${tags.username} ${JoinedMessage} the queue! You have about ${estPlayerHour} hours and ${estPlayerMin} minutes until you're up!`);
						}
					}else{
						client.say(channel, `${tags.username} ${JoinedMessage} the queue! You are in the days wait time FUCKIN RIP, you should probably just leave`);
					}
					return;
				}
			}	
		}
		client.say(channel, `@${tags.username} You have about infinity minutes until you're up cause you ain't in queue weirdo.`);
		
	}else if (command === 'remove'){
		user = argument.toString();
		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				player.username = UserList[i].username;
				player.points = UserList[i].points;

				LeftUserList.push(player);

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
	}
});
