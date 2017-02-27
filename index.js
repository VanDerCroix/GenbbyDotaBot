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
