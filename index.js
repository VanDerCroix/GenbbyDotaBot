var util = require("util");

var Dota2Bot = require("./libs/bot");
/*

Wrapper Funcs

    Dota2Bot.getMMR
    Dota2Bot.getStats
    Dota2Bot.winRate
    Dota2Bot.startLobby

Emmited Events
    Dota2Bot.dota2.emit("botReady");
    Dota2Bot.dota2.emit("lobbyCreated");
    Dota2Bot.dota2.emit("lobbyNotCreated");
        for X reasons, bot could complete the creation of  a lobby
    Dota2Bot.dota2.emit("lobbyLaunched");
    Dota2Bot.dota2.emit("lobbyCanceled");
        lobby was created but bot didnt launch for X reasons
    Dota2Bot.dota2.emit("onMatchStart");
    Dota2Bot.dota2.emit("onMatchEnd");

*/

Dota2Bot.steamClient.connect();


Dota2Bot.dota2.on("botReady", function() {
    util.log("&&&&&&Node-dota2 ready. Bot id: "+Dota2Bot.steamClient.steamID);

    var accountId = "76561198103503560"; //115601790
    // getMMR getStats winRate
    /*Dota2Bot.getStats(Dota2Bot.dota2.ToAccountID(accountId), function (err, res) {
        if (err) {
            throw err;
        } else {
            util.log(res);
        }
    });*/

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
    Dota2Bot.startLobby(teams, properties);
});

Dota2Bot.dota2.on("lobbyLaunched", function() {
    util.log("y'all in position! comencing game");
});
Dota2Bot.dota2.on("lobbyCanceled", function() {
    util.log("bot decided not to launch");
});
Dota2Bot.dota2.on("lobbyNotCreated", function() {
    util.log("bot decided could not create lobby");
});

Dota2Bot.dota2.on("chatChannelsData", function(channels) {
    util.log("chatChanne actualizado");
    util.log(channels);
});

Dota2Bot.dota2.on("lobbyCreated", function() {
    util.log("######bot created lobby");

    Dota2Bot.dota2.on("practiceLobbyUpdate", function() {
        util.log("$$$$$$lobby update inside lobby created");
        // Dota2Bot.dota2.Lobby.state 4
        // Dota2Bot.dota2.Lobby.game_state 22
        switch(Dota2Bot.dota2.Lobby.state){
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
                Dota2Bot.dota2.emit("onMatchStart");
                break;
            case 6: //DOTA_GAMERULES_STATE_POST_GAME
                //ancient broken
                Dota2Bot.dota2.emit("onMatchEnd");
                break;
            case 7: //DOTA_GAMERULES_STATE_DISCONNECT 2min after ancient broken
                // c.d2.GetLobby().AbandonLobby()
                
                break;
        }
    });
});

Dota2Bot.dota2.on("practiceLobbyUpdate", function() {
    util.log("------lobby update outside lobby created");
});