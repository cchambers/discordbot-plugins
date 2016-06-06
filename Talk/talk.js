var cleverbot = require("cleverbot-node");
talkbot = new cleverbot;
cleverbot.prepare(function () { });

exports.k9 = {
    usage: " !k9 <message>",
    description: "Talk to me.",
    process: function (bot, msg, suffix) {
        var conv = suffix.split(" ");
        talkbot.write(conv, function (response) {
            bot.sendMessage(msg.channel, response.message)
        });
    }
}


exports.commands = [
    "k9"
];
