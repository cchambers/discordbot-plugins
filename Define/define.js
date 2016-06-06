var urban = require('urban'),
    request = require('request'),
    xml = require('xml2js');
var getUrl = function (word) {
    return 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/' + word + '?key=4b52f34f-e8da-43ca-a6a3-7b422d74ebc9';
}

exports.random = {
    usage: " || !random",
    description: "Pulls a random entry from urban dictionary.",
    process: function (bot, msg, suffix) {
        urban.random().first(function (json) {
            bot.sendMessage(msg.channel, json.word + ": " + json.definition);
            bot.sendMessage(msg.channel, msg.author + ", " + json.example);
        });
    }
}

exports.define = {
    usage: " || !define <query>",
    description: "Define a word.",
    process: function (bot, msg, suffix) {

        function sendMessages(message, channel, delay) {
            setTimeout(function () {
                bot.sendMessage(channel, message);
            }, delay);
        }

        var query = suffix.toLowerCase();
        console.log(getUrl(query));
        request(getUrl(query), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                xml.parseString(body, function (error, result) {
                    if (error === null) {
                        var entry = result.entry_list.entry;
                        console.log("Worked...");
                        console.log(entry[0].def[0].dt);
                        var defs = entry[0].def[0].dt;
                        bot.sendMessage(msg.channel, query + ": ");
                        for (var x = 0; x < defs; x++) {
                            var delay = 200 * x;
                            console.log(defs[x]);
                            sendMessages(defs[x], msg.channel, delay);
                        }
                        // cycle
                    } else if (response.statusCode != 200) {
                        console.log(response.statusCode);
                    } else {
                        console.log(error);
                        console.log('XML Parsing error.');
                    }
                });
            } else {
                console.log('API connection error.');
            }
        });
    }
}


exports.commands = [
    "define",
    "random"
];

console.log("'Define' plugin loaded!");