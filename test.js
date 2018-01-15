var util = require("util");

var botClass = require(".").BotClass;

/*var bots = [
	
	{
		steam_name : "d2gb0001",
		steam_user : "d2gb0001",
		steam_pass : "passwordrandom123",
		steam_guard_code : "steamGuardCodeIfApplicable"
	},
	
	{
		steam_name : "d2gb0002",
		steam_user : "d2gb0002",
		steam_pass : "passwordrandom123",
		steam_guard_code : "steamGuardCodeIfApplicable"
	},
	{
		steam_name : "d2gb0003",
		steam_user : "d2gb0003",
		steam_pass : "passwordrandom123",
		steam_guard_code : "steamGuardCodeIfApplicable"
	},
	{
		steam_name : "d2gb0004",
		steam_user : "d2gb0004",
		steam_pass : "passwordrandom123",
		steam_guard_code : "steamGuardCodeIfApplicable"
	},
	{
		steam_name : "d2gb0005",
		steam_user : "d2gb0005",
		steam_pass : "passwordrandom123",
		steam_guard_code : "steamGuardCodeIfApplicable"
	}
];*/
var bots = [
	
	{
		steam_name : "d2gb0001",
		steam_user : "d2gb0001",
		steam_pass : "passwordrandom123",
		steam_guard_code : "steamGuardCodeIfApplicable"
	},
];

bots.forEach(function (credentials){
	var bot = new botClass(credentials);
	bot.Dota2Bot.steamClient.connect();

	bot.Dota2Bot.dota2.on('botReady',function(){
		util.log("&&&&&&Node-dota2 ready. Bot id: "+bot.Dota2Bot.steamClient.steamID);

		var accountId = "76561198103503560"; //115601790
		// winRate
		

		//getStats
		/*bot.Dota2Bot.getStats(bot.Dota2Bot.dota2.ToAccountID(accountId), function (err, res) {
		    if (err) {
		        throw err;
		    } else {
		        util.log(res);
		    }
		});*/

		//getMedal
		bot.Dota2Bot.getMedal(bot.Dota2Bot.dota2.ToAccountID(accountId), function (err, res) {
		    if (err) {
		        throw err;
		    } else {
		        util.log(res);
		    }
		});

	    //lobby options
	    var properties = {
	        game_name: "Genbby Lobby Game",
	        pass_key: "123",
	        server_region: 15,
	        game_mode: 1,
	        series_type: 0,
	        game_version: 1,
	        allow_cheats: false,
	        fill_with_bots: false,
	        allow_spectating: true,
	        radiant_series_wins: 0,
	        dire_series_wins: 0,
	        allchat: true
	    }

	    //use STEAMID64 to send invitations
	    var teams = {
	        goodGuys: ["0","1","2","3","4"],
	        badGuys: ["5","6","7","8","76561198103503560"]
	    };

	    // Dota2Bot.dota2.leavePracticeLobby(function(err, data){/*util.log(JSON.stringify(data));*/});
	    bot.Dota2Bot.startLobby(teams, properties, true);
	});

	//inner listener


	bot.Dota2Bot.dota2.on("lobbyCreated", function() {
	    util.log("######bot created lobby");

		bot.Dota2Bot.dota2.on("practiceLobbyUpdate", function() {
		    //util.log(bot.Dota2Bot.dota2.Lobby);
	        switch(bot.Dota2Bot.dota2.Lobby.game_state){
	            case 0: //DOTA_GAMERULES_STATE_INIT
	                //until a launched lobby "find server"
	                //control team slots
	                break;
	            case 1: //DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD
	                //game loading screen
	                break;
	            case 2: //DOTA_GAMERULES_STATE_HERO_SELECTION
	                //hero selection ui
	                util.log("DOTA_GAMERULES_STATE_HERO_SELECTION");
	                break;
	            case 3: //DOTA_GAMERULES_STATE_STRATEGY_TIME
	                //after hero selection MAYBE CHECK FOR HERO
	                break;
	            case 4: //DOTA_GAMERULES_STATE_PRE_GAME
	                //heroes spawn on fountain
	                break;
	            case 5: //DOTA_GAMERULES_STATE_GAME_IN_PROGRESS
	                //creeps spawned
	                util.log("DOTA_GAMERULES_STATE_GAME_IN_PROGRESS");
	                bot.Dota2Bot.dota2.emit("onMatchStart");
	                break;
	            case 6: //DOTA_GAMERULES_STATE_POST_GAME
	                //ancient broken
	                bot.Dota2Bot.dota2.emit("onMatchEnd");
	                util.log(bot.Dota2Bot.dota2.Lobby);
	                break;
	            case 7: //DOTA_GAMERULES_STATE_DISCONNECT 2min after ancient broken
	                // c.d2.GetLobby().AbandonLobby()
	                
	                break;
	        }
		});
	});
});

//listeners
/*botClass.Dota2Bot.dota2.on("lobbyLaunched", function() {
    util.log("y'all in position! comencing game");
});
botClass.Dota2Bot.dota2.on("lobbyCanceled", function() {
    util.log("bot decided not to launch");
});
botClass.Dota2Bot.dota2.on("lobbyNotCreated", function() {
    util.log("bot decided could not create lobby");
});

botClass.Dota2Bot.dota2.on("chatChannelsData", function(channels) {
    util.log("chatChanne actualizado");
    util.log(channels);
});

botClass.Dota2Bot.dota2.on("lobbyCreated", function() {
    util.log("######bot created lobby");

    botClass.Dota2Bot.dota2.on("practiceLobbyUpdate", function() {
        util.log("$$$$$$lobby update inside lobby created");
        // Dota2Bot.dota2.Lobby.state 4
        // Dota2Bot.dota2.Lobby.game_state 22
        switch(botClass.Dota2Bot.dota2.Lobby.state){
            case 0: //DOTA_GAMERULES_STATE_INIT
                //until a launched lobby "find server"
                //control team slots
                break;
            case 1: //DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD
                //game loading screen
                break;
            case 2: //DOTA_GAMERULES_STATE_HERO_SELECTION
                //hero selection ui
                break;
            case 3: //DOTA_GAMERULES_STATE_STRATEGY_TIME
                //after hero selection MAYBE CHECK FOR HERO******************
                break;
            case 4: //DOTA_GAMERULES_STATE_PRE_GAME
                //heroes spawn on fountain
                break;
            case 5: //DOTA_GAMERULES_STATE_GAME_IN_PROGRESS
                //creeps spawned
                botClass.Dota2Bot.dota2.emit("onMatchStart");
                break;
            case 6: //DOTA_GAMERULES_STATE_POST_GAME
                //ancient broken
                botClass.Dota2Bot.dota2.emit("onMatchEnd");
                break;
            case 7: //DOTA_GAMERULES_STATE_DISCONNECT 2min after ancient broken
                // c.d2.GetLobby().AbandonLobby()
                
                break;
        }
    });
});
botClass.Dota2Bot.dota2.on("practiceLobbyUpdate", function() {
    util.log("------lobby update outside lobby created");
});
*/