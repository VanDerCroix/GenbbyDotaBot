var util = require("util");

var botClass = require(".").BotClass;

var bots = [
	
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
];


bots.forEach(function (credentials){
	var bot = new botClass(credentials);
	bot.Dota2Bot.steamClient.connect();

	bot.Dota2Bot.dota2.on('botReady',function(){
		util.log("&&&&&&Node-dota2 ready. Bot id: "+bot.Dota2Bot.steamClient.steamID);

		var accountId = "76561198103503560"; //115601790
		// getMMR getStats winRate
		/*
		bot.Dota2Bot.getStats(bot.Dota2Bot.dota2.ToAccountID(accountId), function (err, res) {
		    if (err) {
		        throw err;
		    } else {
		        util.log(res);
		    }
		});
		*/
	});
});