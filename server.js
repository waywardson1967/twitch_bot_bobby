require('dotenv').config();

const tmi = require('tmi.js');
const { takeCoverage } = require('v8');

const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);

const UserList = [];
const LeftUserList = [];
let AlreadyJoined = 0;

let thanks4PlayingMsg = "Thanks for playing @";
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

let firstChatter = 0;

let errorNum = 0;

let servResetFlag = 0;

let serverResetValid = setInterval(function myServerSet() {
  servResetFlag = 1;
}, 1200000);

let checkingIfTrulyOffline = 0;


let liveStatus_recheckValid = 1;
let liveStatus_rerunAuthentication = 1;

//const fetch = require('node-fetch');
const channelName = 'WaywardSon__';

let clientID = "rj1j53eactrz9mn3rr275j7ydvgtk0";
let clientSecret = "8oks8bqil92n64vqe9qabwclg4d68a";

const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: process.env.TWITCH_BOT_USERNAME,
		password: process.env.TWITCH_OAUTH_TOKEN
	},
	channels: [ 'waywardson__' ]
});

function getTwitchAuthorization() {
    let url = `https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials`;

    return fetch(url, {
		method: "POST",
		})
		.then((res) => res.json())
		.then((data) => {
			return data;
		});
}

/*function handleAuthorization(data) {
    let { access_token, expires_in, token_type } = data;
    console.log(`${token_type} ${access_token}`);
}*/

let authorization;
const endpoint = "https://api.twitch.tv/helix/search/channels?query=waywardson__";//&live_only=true";
async function getAuthorization() {

    let authorizationObject = await getTwitchAuthorization();
    let { access_token, expires_in, token_type } = authorizationObject;
	//console.log(expires_in);
    //token_type first letter must be uppercase    
    token_type =
    token_type.substring(0, 1).toUpperCase() +
    token_type.substring(1, token_type.length);

    authorization = `${token_type} ${access_token}`;
	//fetchInformation();
}

async function fetchInformation(){
    let headers = {
    authorization,
    "Client-Id": clientID,
    };

    fetch(endpoint, {
    headers,
    })
    .then((res) => res.json())
    .then((data) => checkStreamInfo(data));
}

let streamerIsLive = 1;
let prevStreamerIsLive = 1;

function checkStreamInfo(data) {
	/*if(data.hasOwnProperty('pagination')){ //potentially live
		//console.log("that worked");
		for (var i = 0; i < data.data.length; i++){
			//console.log(data.data[i].display_name);
			//console.log(i);
			if(data.data[i].display_name === channelName){
				//streamerLocationInList <= i;
				if (data.data[i].is_live === false){
					streamerIsLive = 0;
					//console.log("not live");
				}else{
					streamerIsLive = 1;
					//console.log("live");
				}
				//console.log(data.data[i].display_name);
				break;
			}else{
				streamerIsLive = 0;
			}
		}

	}else{ //not live
		//console.log("not live");
		streamerIsLive = 0;
	}

	if (prevStreamerIsLive != streamerIsLive){
		if (streamerIsLive === 1){
			prevStreamerIsLive = streamerIsLive;
			if (servResetFlag === 0){
				console.log("Server has reset too recently, resetting it now will crash the system so try again in a bit.");
			} else{
				//this next line should crash the system
				console.log("The server has been reset.");
				log;
			};
		}else if (checkingIfTrulyOffline == 0)
		{//check if he just quickly had to reset the stream or if he really is done streaming by delaying the streamer live reset
			checkingIfTrulyOffline = 1;
			let checkifTrulyOffline = setInterval(function delayReset() {
				prevStreamerIsLive = streamerIsLive;
				checkingIfTrulyOffline = 0;
			  }, 3600000); //60 mins*60sec/min*1000ms/sec = 
		}
	}*/
}

client.connect();

client.on("connected", function (address, port) {
	//checkLiveStatus();
	getAuthorization();
	//fetchInformation();
});

/*let fetchInfo = setInterval(function () {
	fetchInformation();

}, 1000); //in milliseconds -- allowed to do this up to 800 times a minute -- we are doing 1 per second so 60 per minute*/

let getAuth_client = setInterval(function () {
	getAuthorization();
}, 10800000); //this needs to be reset every 4 hours so we shall do it every 3 (3*60*60) = 10,800 seconds = 10,800,000 ms

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
		//client.say(channel, "This should hopefully crash the system technically.");
		return;
	}
	try{
		const [raw, command, argument] = message.match(regexpCommand);	
	}
	catch(err){
		client.say(channel, "Nope, I didn't like that. Perhaps the mods can help you?");
		console.log(err.toString());
		console.log(errorNum.toString());
		return;
	}
	const [raw, command, argument] = message.match(regexpCommand);
	if (command === 'reset'){
		if (tags.badges.hasOwnProperty('broadcaster')) {
			if (servResetFlag === 0){
				client.say(channel,"Server has reset too recently, resetting it now will crash the system so try again in a bit.");
			} else{
				//this next line should crash the system
				client.say(channel,"The server has been reset.");
				log;
			};			
		} else{
			client.say(channel, "Get yo bitch ass outta here. You ain't Kevin.");
		}
	}	
	try{
		
		if (command === 'first'){
			if (streamerIsLive === 0){
				client.say(channel, "He isn't even live, Idjit");
			}
			else if (firstChatter === 0){
				firstChatter = 1;
				client.say(channel, "Well, well, well, if it isn't the first Idjit in stream");
			}else {
				client.say(channel, "GITGUD if you ain't first, you're last");
			}
		}
		
		if (command === 'offQ'){
			qState = 0;
		} else if (command === 'onQ'){
			qState = 1;
		}

		if (qState === 0) return;
		
		if (command === 'add'){
			if (tags.badges.hasOwnProperty('moderator') || tags.badges.hasOwnProperty('broadcaster')) {
				let argNum = 0;
				
				
				if (argument == null){
					client.say(channel, "Silly mod, you need to say WHO you want to add.");
					return;
				}
				const argumentWords2 = argument.split(/[^a-zA-Z0-9_]+/);
				while (argNum < argumentWords2.length){
					let AlreadyInQ = 0;

					user = argumentWords2[argNum];
					
					const newPlayer = {
						username : "waywardson__",
						points : "0"
						};

					newPlayer.username = user;
					newPlayer.points = 0;
					
					AlreadyInQ = 0;
					for (let i = 0; i < UserList.length; i++){
						if (UserList[i].username === user){
							AlreadyInQ = 1;
							break;
						}
					}
					
					if (AlreadyInQ == 0){	
						UserList.push(newPlayer);
					}
					argNum++;
				}
				user = UserList[0].username;
				for (let i = 1; i < UserList.length; i++){
					user = user.concat(", ", UserList[i].username);	
				}
				str = queueViewMsg.concat(user.toString());
				client.say(channel, str);
			}else{
				return;
			}
		}
		else if (command === 'join'){
			AlreadyJoined = 0;
			errorNum = 1;
			
			user = tags['display-name'].toString();
			JoinedMessage = " joined ";
			
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
			errorNum = 3;
			if (AlreadyJoined == 0){
				errorNum = 4;
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
				errorNum = 5;
				if (command === 'join'){
					errorNum = 6;
					if (tags.badges === null){
						errorNum = 55;
					}else {
						errorNum = 60;
					}

					if (tags.badges === null){
						errorNum = 8;
						player.points = 0;
					}
					else {
						//errorNum = 7;
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
						errorNum = 20;
						if (tags.badges.hasOwnProperty('moderator')){
							player.points = player.points + 3;
						}else if (tags.badges.hasOwnProperty('vip')){
							player.points = player.points + 3;
						}
					}
					errorNum = 9;
				}
				errorNum = 10;
			}
			errorNum = 11;
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
						estPlayerTime = (i+1-numPlayersLive) ;
						client.say(channel, `${user} ${JoinedMessage} the queue! You have ${estPlayerTime} games until you're up!`);
						return;
					}	
				}
				UserList.push(player);
				estPlayerTime = ((UserList.length)-numPlayersLive);
				client.say(channel, `${user} ${JoinedMessage} the queue! You have ${estPlayerTime} games until you're up!`);
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
			client.say(channel, `@${tags['display-name']} - This idjit thinks they are in the queue. LOL idiot.`);
		} else if (command === 'point'){
			user = tags['display-name'].toString();
			for(let i = 0; i < UserList.length; i++){ 
				if (UserList[i].username === user){
					client.say(channel, `@${tags['display-name']} your point allocation is : ${UserList[i].points}`);
					return;
				}
			}
			
			client.say(channel, `umm @${tags['display-name']} you aren't in queue... idjit...`);

			/*for(let i = 0; i < UserList.length; i++){
				client.say(channel, `@${UserList[i].username} your point allocation is : ${UserList[i].points}`);
			}*/

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

				user = UserList[0].username;
				str = thanks4PlayingMsg.concat(user.toString());
				client.say(channel, str);

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
						client.say(channel, `@${user} Umm you're currently playing idjit`);
						return;
					}else if (i < numPlayersLive) {
						client.say(channel, `@${user} You're up next! Yay!`);
						return;
					} else{
						estPlayerTime = (i+1-numPlayersLive);
						client.say(channel, `${user} You have ${estPlayerTime} games until you're up!`);
						return;
					}
				}	
			}
			client.say(channel, `@${user} You have about infinity games until you're up cause you ain't in queue idjit.`);
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
			client.say(channel, "But that person ain't even in queue idjit.");
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
			client.say(channel, "But that person ain't even in queue idjit.");
		}
	}catch(err){
		client.say(channel, "Nope, I didn't like that. Perhaps the mods can help you?");
		console.log(err.toString());
		console.log(errorNum.toString());
		return;
	}
});
