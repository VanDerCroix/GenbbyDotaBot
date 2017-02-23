var steam = require("steam"),
    util = require("util"),
    fs = require("fs"),
    crypto = require("crypto"),
    dota2 = require("dota2"),
    steamClient = new steam.SteamClient(),
    steamUser = new steam.SteamUser(steamClient),
    steamFriends = new steam.SteamFriends(steamClient),
    Dota2 = new dota2.Dota2Client(steamClient, true);

global.config = require("./config");

var onSteamLogOn = function onSteamLogOn(logonResp) {
    if (logonResp.eresult == steam.EResult.OK) {
        steamFriends.setPersonaState(steam.EPersonaState.Busy);
        steamFriends.setPersonaName("Dota 2 Bot");
        util.log("Logged on.");

        Dota2.launch();

        Dota2.on("unready", function onUnready() {
            util.log("Node-dota2 unready.");
        });

        /*Dota2.on("chatMessage", function(channel, personaName, message) {
            util.log("[" + channel + "] " + personaName + ": " + message);
        });*/

        Dota2.on("unhandled", function(kMsg) {
            util.log("UNHANDLED MESSAGE #" + kMsg);
        });
    }
},
onSteamServers = function onSteamServers(servers) {
    util.log("Received servers.");
    fs.writeFile('servers', JSON.stringify(servers));
},
onSteamLogOff = function onSteamLogOff(eresult) {
    util.log("Logged off from Steam.");
},
onSteamError = function onSteamError(error) {
    util.log("Connection closed by server.");
};

steamUser.on('updateMachineAuth', function(sentry, callback) {
    var hashedSentry = crypto.createHash('sha1').update(sentry.bytes).digest();
    fs.writeFileSync('sentry', hashedSentry)
    util.log("sentryfile saved");

    callback({ sha_file: hashedSentry});
});

var logOnDetails = {
    "account_name": global.config.steam_user,
    "password": global.config.steam_pass,
};
if (global.config.steam_guard_code) logOnDetails.auth_code = global.config.steam_guard_code;


try {
    var sentry = fs.readFileSync('sentry');
    if (sentry.length) logOnDetails.sha_sentryfile = sentry;
}
catch (beef){
    util.log("Cannot load the sentry. " + beef);
}

// steamClient.connect();

steamClient.on('connected', function() {
    steamUser.logOn(logOnDetails);
});

steamClient.on('logOnResponse', onSteamLogOn);
steamClient.on('loggedOff', onSteamLogOff);
steamClient.on('error', onSteamError);
steamClient.on('servers', onSteamServers);


// Wrapper ***********************************************************************************

var Dota2Bot = {};
Dota2Bot.steamClient = steamClient;
Dota2Bot.dota2 = Dota2;

// Profile Api
Dota2Bot.getMMR = function(accountId, callback) {
    var mmr = {
        solo: 0,
        party: 0
    }

    Dota2Bot.dota2.requestProfileCard(accountId, function (err, data) {
        // util.log(JSON.stringify(data));
        if (err){
            callback(err, null);
        } else {
            data.slots.forEach(function (slot) {
                if (slot.stat) {
                    switch (slot.stat.stat_id) {
                        case 1:
                        // util.log("mmr solo: " + slot.stat.stat_score);
                        mmr.solo = slot.stat.stat_score;
                        break;
                        case 2:
                        // util.log("mmr party: " + slot.stat.stat_score);
                        mmr.party = slot.stat.stat_score;
                        break;
                        default:
                        break;
                    }
                }
            });
            callback(null, mmr);
        }
    });
};

Dota2Bot.getStats = function(accountId, callback) {
    Dota2Bot.dota2.requestPlayerStats(accountId, function (err, data) {
        // some calcs
        if (err){
            callback(err, null);
        } else {
            callback(null, data);
        }

    });
};

Dota2Bot.winRate = function(accountId, callback) {
    var heroes = [];
    var heroes_lookup = [];
    var piv;
    var options = {
        start_at_match_id: 0,
        matches_requested: 20
    }
    var response = {
        top_3_heroes: [],
        wins: 0,
        matches: 0
    }

    Dota2Bot.dota2.requestPlayerMatchHistory(accountId, options, function(err, data){
        if (err){
            callback(err, null);
        } else {
            data.matches.forEach(function (match) {
                piv = heroes_lookup.indexOf(match.hero_id)
                if ( piv == -1) { //new entry
                    heroes_lookup.push(match.hero_id);
                    heroes.push({
                        heroId: match.hero_id,
                        games: 1,
                        wins: ((match.winner) ? 1 : 0)
                    });
                } else { //plus 1 to entry
                    heroes[piv].games++;
                    heroes[piv].wins += (match.winner) ? 1 : 0;
                }
                //options.start_at_match_id = match.match_id;
            });
            heroes.sort(function(a,b) {return (a.games < b.games) ? 1 : ((b.games < a.games) ? -1 : 0);} );

            response.top_heroes = heroes.slice(0, 3);
            response.wins = heroes.reduce(function(a, b) { return a + b.wins; }, 0);
            response.matches = data.matches.length;
           
            callback(null, response);
        }
    });
};

// Lobby Api

Dota2Bot.startLobby = function(teams, properties) {
    var chatName = ""; 
    if (!properties) {
        Dota2Bot.dota2.emit("lobbyNotCreated");
        return;
    }
    Dota2Bot.dota2.createPracticeLobby(properties.pass_key, properties, function(err, data){
        if (err) {
            Dota2Bot.dota2.emit("lobbyNotCreated");
        } else {
            Dota2Bot.dota2.emit("lobbyCreated");
            util.log(JSON.stringify(data));
            // Make DotaBot clear his slot Dota2Bot.steamClient.steamID
            Dota2Bot.dota2.practiceLobbyKickFromTeam(Dota2Bot.dota2.ToAccountID(Dota2Bot.steamClient.steamID), function(err,res){
                if (err) {
                    /*Dota2.leavePracticeLobby(function(err, data){
                        util.log(JSON.stringify(data));
                    });*/
                    util.log(err);
                }
            });

            // Dota2.inviteToLobby("76561198103503560");
            teams.goodGuys.forEach(function (radiantPlayer) {
                Dota2Bot.dota2.inviteToLobby(radiantPlayer);
            });
            teams.badGuys.forEach(function (direPlayer) {
                Dota2Bot.dota2.inviteToLobby(direPlayer);
            });

            chatName = "Lobby_" + Dota2Bot.dota2.Lobby.lobby_id;
            Dota2Bot.dota2.joinChat(chatName, 3);
            // setTimeout(function(){ Dota2.sendMessage(chatName, "hello", 3); }, 3000);
            var i = 60;
            var interv = setInterval(function(){
                switch (--i) {
                    case 55: case 45: case 35: case 25: case 15: case 10:
                    Dota2Bot.dota2.sendMessage(chatName, "lobby launch in T - " + i, 3);
                    Dota2Bot._lobbySlotControl(teams, chatName);
                    break;
                    case 0:
                    //launch lobby
                    // Dota2.sendMessage(chatName, "launch!", 3);
                    Dota2Bot._prelaunchControl(teams, function (check, resp) {
                        if (check != 10) {
                            util.log(check + " playas ready only! offenders: " + resp);
                            Dota2Bot.dota2.leaveChat(chatName, 3);
                            Dota2Bot.dota2.leavePracticeLobby(function(err, data){});
                            Dota2Bot.dota2.emit("lobbyCanceled");
                        } else {
                            Dota2Bot.dota2.launchPracticeLobby(function(err, data){});
                            Dota2Bot.dota2.emit("lobbyLaunched");
                        }
                    });
                    clearInterval(interv);
                    break;
                }
            }, 1000);
        }
    });
};

Dota2Bot._lobbySlotControl = function (teams, chatName) {
    Dota2Bot.dota2.Lobby.members.forEach(function (member) {

        // if (member.id == (Dota2.AccountID)) { 
        if (member.id == Dota2Bot.steamClient.steamID) { // AccountID
            // util.log("lobby bot found!");
        } else {
            var inRadiantTeam = teams.goodGuys.indexOf(member.id.toString()) != -1;
            var inDireTeam = teams.badGuys.indexOf(member.id.toString()) != -1;

            if (!inRadiantTeam && !inDireTeam) {
                // remove from lobby
                Dota2Bot.dota2.practiceLobbyKick(Dota2Bot.dota2.ToAccountID(member.id), function(err,res){
                    if (err) {util.log(err);}
                });
            } else {
                switch (member.team) {
                    case 0: // goodGuys
                        if (!inRadiantTeam && inDireTeam) {
                            //wrong team, kick from team
                            Dota2Bot.dota2.practiceLobbyKickFromTeam(Dota2Bot.dota2.ToAccountID(member.id), function(err,res){
                                if (err) {util.log(err);}
                            });
                            Dota2Bot.dota2.sendMessage(chatName, "Player "+member.name+", take a slot in the dire team.", 3);
                        }
                        break;
                    case 1: // badGuys
                        if (inRadiantTeam && !inDireTeam) {
                            //wrong team, kick from team
                            Dota2Bot.dota2.practiceLobbyKickFromTeam(Dota2Bot.dota2.ToAccountID(member.id), function(err,res){
                                if (err) {util.log(err);}
                            });
                            Dota2Bot.dota2.sendMessage(chatName, "player "+member.name+", take a slot in the radiant team.", 3);
                        }
                        break;
                    case 3: // spectator
                        switch (member.coach_team) { // no coaching allowed
                            case 0: // coach for goodGuys
                                Dota2Bot.dota2.practiceLobbyKickFromTeam(Dota2Bot.dota2.ToAccountID(member.id), function(err,res){
                                    if (err) {util.log(err);}
                                });
                                Dota2Bot.dota2.sendMessage(chatName, "player "+member.name+" no coaching allowed!", 3);
                                break;
                            case 1: // coach for badGuys
                                Dota2Bot.dota2.practiceLobbyKickFromTeam(Dota2Bot.dota2.ToAccountID(member.id), function(err,res){
                                    if (err) {util.log(err);}
                                });
                                Dota2Bot.dota2.sendMessage(chatName, "player "+member.name+" no coaching allowed!", 3);
                                break;
                        }
                        break;
                }
            }
        }
    });
/*    // clear AI from slots, lattest updates disabled placing AI on slots
    Dota2.Lobby.bot_slot_difficulty.forEach(function (value, i) {
        // util.log('%d: %s', i, value);
        if (value != 5) {
            if (key < 5) {
                //set slot free
                Dota2.addBotToPracticeLobby(key+1,0,5, function(err,res){});
            } else {
                //set slot free
                Dota2.addBotToPracticeLobby(key-4,1,5, function(err,res){});
            }
        }
    });*/
};

//ver 1.0
Dota2Bot._prelaunchControl = function (teams, callback) {
    //loop through lobby members
    //use indexOf on teams to check correct slot and increase counter
    //at the end of the loop counter must reach 10, otherwise cancel launch
    var offenders = [];
    var allSet = 0;

    Dota2Bot.dota2.Lobby.members.forEach(function (member) {
        if (member.id == Dota2Bot.steamClient.steamID) { // AccountID
            // respect lobby bot
        } else {
            switch (member.team) {
                case 0: // gooddies
                    // allSet += teams.goodGuys.indexOf(member.id.toString()) == -1 ? 0 : 1;
                    if (teams.goodGuys.indexOf(member.id.toString()) == -1) {
                        // util.log("off found "+member.name);
                        offenders.push(member.id.toString());
                    } else {
                        // util.log("well pos "+member.name);
                        allSet++;
                    }
                    break;
                case 1: // baddies
                    // allSet += teams.badGuys.indexOf(member.id.toString()) == -1 ? 0 : 1;
                    if (teams.badGuys.indexOf(member.id.toString()) == -1) {
                        // util.log("off found "+member.name);
                        offenders.push(member.id.toString());
                    } else {
                        // util.log("well pos "+member.name);
                        allSet++;
                    }
                    break;
            }
        }
    });
    // util.log("allset:" + allSet);
    // util.log("offf:" + offenders);
    if (allSet == 10) {
        callback(null, null);
    } else {
        callback(allSet, offenders);
    }
};


//equivalencia de export default Dota2Bot en es5
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.Dota2Bot = Dota2Bot;