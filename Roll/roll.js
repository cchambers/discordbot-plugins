var d20 = require("d20");

exports.roll = {
    usage: " || !roll 6d8+2 || !roll stats",
    description: "Roll dice with a syntax you know.",
    process: function (bot, msg, suffix) {
        if (suffix.toLowerCase() == "stats") {
            var rolls = [];
            var fixedRolls = [];
            var sums = []
            rolls[0] = d20.roll("4d6", true);
            rolls[1] = d20.roll("4d6", true);
            rolls[2] = d20.roll("4d6", true);
            rolls[3] = d20.roll("4d6", true);
            rolls[4] = d20.roll("4d6", true);
            rolls[5] = d20.roll("4d6", true);

            for (var i = 0; i < rolls.length; i++) {
                var dice = JSON.stringify(rolls[i]);
                var sum = 0;
                dice = dice.substr(1);
                dice = dice.substr(0, dice.length - 1);
                dice = dice.split(",");

                for (var x = 0; x < dice.length; x++) {
                    if (parseInt(dice[x]) == 1) {
                        dice[x] = d20.roll("d6");
                    }
                }

                dice = dice.sort(function (a, b) {
                    return a - b;
                });

                var toAdd = dice.slice(1, 4);

                for (var x = 0; x < toAdd.length; x++) {
                    sum += parseInt(toAdd[x]);
                }
                sums[i] = sum;
                fixedRolls[i] = "`" + sum + "` = " + dice[1] + " + " + dice[2] + " + " + dice[3] + " ... *" + dice[0] + "*";
            }

            bot.sendMessage(msg.channel, msg.author + " " + fixedRolls[0]);
            bot.sendMessage(msg.channel, msg.author + " " + fixedRolls[1]);
            bot.sendMessage(msg.channel, msg.author + " " + fixedRolls[2]);
            bot.sendMessage(msg.channel, msg.author + " " + fixedRolls[3]);
            bot.sendMessage(msg.channel, msg.author + " " + fixedRolls[4]);
            bot.sendMessage(msg.channel, msg.author + " " + fixedRolls[5]);
        } else if (suffix.split("d").length <= 1) {
            bot.sendMessage(msg.channel, msg.author + " rolled a `" + d20.roll(suffix || "20") + "`");
        }
        else if (suffix.split("d").length > 1) {
            var eachDie = suffix.split("+");
            var passing = 0;
            for (var i = 0; i < eachDie.length; i++) {
                if (eachDie[i].split("d")[0] <= 100) {
                    passing += 1;
                };
            }
            if (passing == eachDie.length) {

                var amount = d20.roll(suffix, true);

                var dice = JSON.stringify(amount);
                dice = dice.substr(1);
                dice = dice.substr(0, dice.length - 1);
                dice = dice.split(",");

                amount = dice.join(" + ");

                var sum = 0;

                for (var x = 0; x < dice.length; x++) {
                    sum += parseInt(dice[x]);
                }
                var message = msg.author + " rolls `" + sum + "`";
                if (dice.length > 1) {
                    message += " = ( " + amount + " )";
                }
                if (isNaN(sum)) {
                    bot.sendMessage(msg.channel, "That is a strange request.");
                } else {
                    bot.sendMessage(msg.channel, message);
                }
            } else {
                bot.sendMessage(msg.channel, msg.author + " tried to roll too many dice!");
            }
        }
    }
}


exports.commands = [
	"roll"
];
