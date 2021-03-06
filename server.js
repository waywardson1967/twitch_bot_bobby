require('dotenv').config();

const tmi = require('tmi.js');
const { takeCoverage } = require('v8');

const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/); //

const UserList = [];
const LeftUserList = [];
let AlreadyJoined = 0;

let queueViewMsg = "The queue : ";
let livePlayer = "Live Players : ";
let nextPlayer = "You're up next! @";

let nextPlayerUsername = "Waywardson__";

var str;
let user;

let firstInQueueFlag = 0;
let secondInQueueFlag = 0;

let numPlayersLive = 3;

let estPlayerTime = 0;
let estPlayerMin = 0;
let estPlayerHour = 0;

let JoinedMessage = " joined ";

let argumentWords = [];

let qState = 1;

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
	const player = {
	username : "waywardson__",
	points : "0"
	};
    const isNotBot = tags.username.toLowerCase() !== process.env.TWITCH_BOT_USERNAME;
    
    if (!isNotBot) return;
	if(message.charAt(0) != "!") return;
	if (message.length == 1) return;
	if(message.charAt(1) == " ") return;
	if((/[a-zA-Z]/).test(message.charAt(1))){
		//DO NOTHING
	}
	else {
		return;
	}
    const [raw, command, argument] = message.match(regexpCommand);	

	if (command === 'offQ'){
		qState = 0;
	} else if (command === 'onQ'){
		qState = 1;
	}

	if (qState === 0) return;

    if (command === 'join' || command ==='add'){

		AlreadyJoined = 0;
		if (command === 'add'){
			if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
				if (argument == null){
					client.say(channel, "Silly mod, you need to say WHO you want to add.");
					return;
				}
				argumentWords = argument.split(/[^a-zA-Z0-9_]+/);
				
				if (argumentWords.length > 1){
					client.say(channel, "Silly mod, that's not a valid name.");
					return;
				}

				user = argument.toString();
				player.username = user;
				/*if (firstInQueueFlag === 0){
					player.points = 3;
					firstInQueueFlag = 1;
				}else if (secondInQueueFlag === 0){
					player.points = 2;
					secondInQueueFlag = 1;
				}else
				{*/
					player.points = 0;
				//}
				AlreadyJoined = 1;
				JoinedMessage = " was added to ";
			}else{
				return;
			}
		} else{
			user = tags['display-name'].toString();
			
			JoinedMessage = " joined ";
		}

		for (let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
		    	client.say(channel, `${user} is already in the queue!`);
				return;
			}
	    }

		for (let i = 0; i < LeftUserList.length; i++){
			if (LeftUserList[i].username === user){
				AlreadyJoined = 1;
				player.username = LeftUserList[i].username;
				player.points = LeftUserList[i].points;
				/*if (firstInQueueFlag === 0){
					player.points = player.points + 3;
					firstInQueueFlag = 1;
				}else if (secondInQueueFlag === 0){
					player.points = player.points + 2;
					secondInQueueFlag = 1;
				}*/
				JoinedMessage = " rejoined ";
				LeftUserList.splice(i,1);
				break;
			}
		}
		client.say(channel, "got here 1");
		let testing = AlreadyJoined.toString();
		client.say(channel, testing);
		client.say(channel, "got here 1.25");
		if (AlreadyJoined == 0){
			//client.say(channel, "got here 1.5");
			player.username = user;
			//client.say(channel, "got here 1.75");
			/*if (firstInQueueFlag === 0){
				player.points = 3;
				firstInQueueFlag = 1;
			}else if (secondInQueueFlag === 0){
				player.points = 2;
				secondInQueueFlag = 1;
			}else
			{*/
			player.points = 0;
			//}
			//client.say(channel, "got here 2");
			if (command === 'join'){
				//client.say(channel, "got here 3");
				if (tags.hasOwnProperty('badges')){
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
				} else {
					player.points = 0;
				}
				
			}
		}
	    
		//client.say(channel, "got here 4");
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
					estPlayerTime = (i+1-numPlayersLive) * 20;
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
			if (estPlayerTime < 60){
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
		user = tags['display-name'].toString();
		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				player.username = UserList[i].username;
				player.points = UserList[i].points;

				LeftUserList.push(player);

				UserList.splice(i,1);
				client.say(channel, `${tags['display-name']} has left the queue!`);
				/*if (UserList.length === 0){
					firstInQueueFlag = 0;
					secondInQueueFlag = 0;
				} else if (UserList.length === 1){
					secondInQueueFlag = 0;
				}*/
				return;
			}
		}
	    client.say(channel, `@${tags['display-name']} - This dumbass thinks they are in the queue. LOL idiot.`);
    } else if (command === 'point'){
		user = tags['display-name'].toString();
		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				client.say(channel, `@${tags['display-name']} your point allocation is : ${UserList[i].points}`);
				return;
			}
		}
		
		client.say(channel, `umm @${tags['display-name']} you aren't in queue... awks...`);

		/*for(let i = 0; i < UserList.length; i++){
			client.say(channel, `@${UserList[i].username} your point allocation is : ${UserList[i].points}`);
		}*/

	} else if (command === 'reset' ){
		if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
			UserList.length = 0;
			LeftUserList.length = 0;

			firstInQueueFlag = 0;
			secondInQueueFlag = 0;
			numPlayersLive = 3;

			client.say(channel, "Queue and points has been reset.");
		} else{
			client.say(channel, "Get yo bitch ass outta here. You ain't a mod.");
		}
	} else if (command === 'clear' ){
		if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
			let len = UserList.length;
			let leftLen = LeftUserList.length;
			for (let i = 0; i < len; i++){
				const byePlayer = {
					username : "waywardson__",
					points : "0"
					};
				byePlayer.username = UserList[0].username;
				byePlayer.points = UserList[0].points;

				LeftUserList.push(byePlayer);

				UserList.shift();
				
			}

			firstInQueueFlag = 0;
			secondInQueueFlag = 0;

			client.say(channel, "Queue cleared.");
		} else{
			client.say(channel, "Get yo bitch ass outta here. You ain't a mod.");
		}	
	} else if (command === 'position' || command === 'pos'){
		if (argument == null){
			user = tags['display-name'].toString();
			for(let i = 0; i < UserList.length; i++){
				if (UserList[i].username === user){
					client.say(channel, `@${tags['display-name']} your position in queue is : ${i+1}`);
					return;
				}
			}
			client.say(channel, `@${tags['display-name']} Homie, you ain't in queue.`);	
		}else{
			user = argument.toString();
			for(let i = 0; i < UserList.length; i++){
				if (UserList[i].username === user){
					client.say(channel, `@${user} your position in queue is : ${i+1}`);
					return;
				}
			}
			client.say(channel, `${user} isn't in queue.`);
		}
		
	} else if (command === 'next'){
		if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
			
			if (UserList.length < numPlayersLive+1) {
				client.say(channel, "Nah, you good to keep playing.");
				return;
			}

			player.username = UserList[0].username;
			if (firstInQueueFlag === 0){
				player.points = 1;
				firstInQueueFlag = 1;
			}else{
				player.points = 0;
			}
			

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
	} else if (command === 'bump') {
		if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
			if (argument == null){
				client.say(channel, "Silly mod, you need to say WHO you want to bump.");
				return;
			}
			argumentWords = argument.split(/[^a-zA-Z0-9_]+/);
			if (argumentWords.length != 1){
				client.say(channel, "Silly mod, that's not a valid entry.");
				return;
			}

			user = argumentWords[0].toString();
			if (UserList.length > numPlayersLive){
				nextPlayerUsername = UserList[numPlayersLive].username;
			}

			for (let i = 0; i < UserList.length; i++){
				if (UserList[i].username === user){

					if (i < numPlayersLive-1){
						client.say(channel, "you no bump this person");
						return;
					}

					player.username = user;

					if (UserList[i].points > 0){
						player.points = UserList[i].points - 1;
					}else{
						player.points = UserList[i].points;
					}

					UserList.splice(i,1);

					if (UserList.length > i+1){
						UserList.splice(i+1, 0, player);
					}else{
						UserList.push(player);
					}

					
					user = UserList[numPlayersLive].username;

					if (nextPlayerUsername === user || UserList.length < numPlayersLive+1){
						return;
					}

					str = nextPlayer.concat(user.toString());
					client.say(channel, str);
					return;
				}	
			}
			client.say(channel, "Can't bump someone who ain't in queue, idjit.");
		}else{
			if (argument == null){
				client.say(channel, `If you want to bump yourself down one spot please @ yourself after the command ex: !bump @${tags['display-name']}`);
				return;
			}
			argumentWords = argument.split(/[^a-zA-Z0-9_]+/);

			user = argumentWords[0].toString();
			if (UserList.length > numPlayersLive){
				nextPlayerUsername = UserList[numPlayersLive].username;
			}

			if (tags['display-name'] === user){
				for (let i = 0; i < UserList.length; i++){
					if (UserList[i].username === user){
						if (i < numPlayersLive-1){
							client.say(channel, "you no bump this person");
							return;
						}
	
						player.username = user;
	
						if (UserList[i].points > 0){
							player.points = UserList[i].points - 1;
						}else{
							player.points = UserList[i].points;
						}
	
						UserList.splice(i,1);
	
						if (UserList.length > i+1){
							UserList.splice(i+1, 0, player);
						}else{
							UserList.push(player);
						}
	
						
						user = UserList[numPlayersLive].username;

						if (nextPlayerUsername === user || UserList.length < numPlayersLive+1){
							return;
						}

						str = nextPlayer.concat(user.toString());
						client.say(channel, str);
						return;
					}	
				}
				client.say(channel, "But you ain't even in queue...");
			}else{
				client.say(channel, "You can't bump others silly.");
			}
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
	} else if (command === 'est' || command === 'estimate' || command === 'time' || command === 'eta'){
		if (argument == null){
			user = tags['display-name'].toString();
		}else{
			argumentWords = argument.split(/[^a-zA-Z0-9_]+/);
			user = argumentWords[0].toString();
		}

		for (let i = 0; i < UserList.length; i++){
			if (user === UserList[i].username){
				if (i < numPlayersLive){
					client.say(channel, `@${user} Umm you're currently playing weirdo`);
					return;
				}else if (i < numPlayersLive) {
					client.say(channel, `@${user} You're up next! Yay!`);
					return;
				} else{
					estPlayerTime = (i+1-numPlayersLive) * 20;
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
		}
		client.say(channel, `@${user} You have about infinity minutes until you're up cause you ain't in queue weirdo.`);
	} else if (command === 'move') {
		if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
			if (argument == null){
				client.say(channel, "Silly mod, you need to say WHO you want to move and where. !move user position#");
				return;
			}
			argumentWords = argument.split(/[^a-zA-Z0-9_]+/);
			if (argumentWords.length != 2){
				client.say(channel, "Silly mod, that's not a valid entry. !move user position#");
				return;
			}

			user = argumentWords[0].toString();
			if (UserList.length > numPlayersLive){
				nextPlayerUsername = UserList[numPlayersLive].username;
			}

			let position = parseInt(argumentWords[1]);

			if (isNaN(position)){
				client.say(channel, "No I need a NUUUUMBER for the position idjit.");
				return;
			}

			for (let i = 0; i < UserList.length; i++){
				if (UserList[i].username === user){
					player.username = user;

					player.points = UserList[i].points;

					UserList.splice(i,1);

					if (position > UserList.length){
						UserList.push(player)
					}else{
						UserList.splice(position-1,0, player);
					}

					user = UserList[numPlayersLive].username;

					if (nextPlayerUsername === user || UserList.length < numPlayersLive+1){
						return;
					}
					
					str = nextPlayer.concat(user.toString());
					client.say(channel, str);
					return;
				}	
			}
			client.say(channel, "Can't move someone who ain't in queue, idjit.");
		}else{
			client.say(channel, "You ain't got the RIGHTS to do that.");
			return;
		}	
	}else if (command === 'remove'){
		if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
			if (argument == null){
				client.say(channel, "Silly mod, you need to say WHO you want to remove.");
				return;
			}
			argumentWords = argument.split(/[^a-zA-Z0-9_]+/);
			
			if (argumentWords.length > 1){
				client.say(channel, "Silly mod, that's not a valid name.");
				return;
			}

			user = argument.toString();
		}else{
			return;
		}

		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				player.username = user;
				player.points = 0;

				LeftUserList.push(player);

				UserList.splice(i,1);
				client.say(channel, `${user} has been removed the queue!`);
				/*if (UserList.length === 0){
					firstInQueueFlag = 0;
					secondInQueueFlag = 0;
				} else if (UserList.length === 1){
					secondInQueueFlag = 0;
				}*/
				return;
			}
		}
		client.say(channel, "But that person ain't even in queue doh man.");
	} else if (command === 'addpoints'){
		let NewPoints = 0;
		if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
			if (argument == null){
				client.say(channel, "Silly mod, you need to say WHO you want to give point allocations to and how much smh.");
				return;
			}
			argumentWords = argument.split(/[^a-zA-Z0-9_]+/);
			if (argumentWords.length != 2){
				client.say(channel, "Silly mod, that's not a valid entry.");
				return;
			}
			NewPoints = parseInt(argumentWords[1]);
			
			if (isNaN(NewPoints)){
				client.say(channel, "No I need a NUUUUMBER to add idjit.");
				return;
			}

			user = argumentWords[0].toString();
		}else{
			return;
		}

		for(let i = 0; i < UserList.length; i++){
			if (UserList[i].username === user){
				player.username = user;
				player.points = UserList[i].points + NewPoints;
				
				if (i < numPlayersLive+1){
					client.say(channel, `${user}'s point allocation has been increased.`);
					UserList[i].points = UserList[i].points + NewPoints;
					return;
				}else{
					UserList.splice(i,1);

					for (let i = numPlayersLive+1; i < UserList.length; i++){
						if (player.points > UserList[i].points){
							UserList.splice(i, 0, player);
							client.say(channel, `${user}'s point allocation has been increased. Have fun jumping around in the queue!`);
							return;
						}	
					}
					UserList.push(player);
					client.say(channel, `${user}'s point allocation has been increased. Have fun moving up the queue! oh... awks you're last.. well that didn't help...`);
					
					return;
				}
				
			}
		}
		client.say(channel, "But that person ain't even in queue doh man.");
	} 
});
