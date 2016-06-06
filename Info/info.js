var request = require("request");
var AuthDetails = require("../../auth.json");

var fs = require('fs');
var path = require('path');

var diretoryTreeToObj = function (dir, done) {
    var results = [];

    fs.readdir(dir, function (err, list) {
        if (err)
            return done(err);

        var pending = list.length;

        if (!pending)
            return done(null, { name: path.basename(dir), type: 'folder', children: results });

        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {

                } else {
                    var filename = path.basename(file)
                    var item = filename.substr(0, filename.length - 9);
                    results.push(item);
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};

var dataList;
var dirTree = ('/home/discordbot/plugins/Info/data');

diretoryTreeToObj(dirTree, function (err, res) {
    if (err)
        console.error(err);
    dataList = res;
});

function search(array, term) {
    var results;
    results = array.filter(function (entry) {
        return entry.toLowerCase().indexOf(term) !== -1;
    });
    return results;
}


exports.commands = [
    "info"
];

exports.info = {
    usage: "<search query>",
    description: "Returns info on stuff!",
    process: function (bot, msg, args) {
        function sendMessages(message, channel, delay) {
            setTimeout(function () {
                bot.sendMessage(channel, message);
            }, delay);
        }
        
        var term = args.toLowerCase();
        var results = search(dataList, term.replace(/\s+/g, '-'));
       
        var others = [];
        if (results.length != 0) {
            var perfect = results.indexOf();
            
            if (perfect >= 0) {
                var single = results.splice(perfect, 1);
                others = results;
                results = single;
            }
            
            if (results.length > 1) {
                bot.sendMessage(msg.channel, "I found **" + results.length + "** information matching that term: ```" + results.join(", ") + "```");
            } else {
                var file = results[0].replace(/\s/g, "-") + ".markdown";
                console.log("Trying to pull " + file);
                var filename = '/home/discordbot/plugins/Info/data/' + file;
                fs.readFile(filename, 'utf8', function (err, data) {

                    if (err) throw err;
                    var meat = data;
                    if (others.length > 0) {
                        bot.sendMessage(msg.channel, "I found **" + others.length + "** other information matching that term: ```" + others.join(", ") + "```");
                    }
                    var messages = meat.split("===");
                    for (var x = 0; x < messages.length; x++) {
                        var delay = 500 * x;
                        var channel = msg.channel;
                        sendMessages(messages[x], channel, delay);
                    }
                });
            }
        } else {
            bot.sendMessage(msg.channel, "I have nothing on that...");
        }
    }
}


exports.information = {
    usage: "",
    description: "Reloads information and shows count.",
    process: function (bot, msg, args) {
        diretoryTreeToObj(dirTree, function (err, res) {
            if (err) console.error(err);
            dataList = res;
            bot.sendMessage(msg.channel, "I have data on " + dataList.length + " information. Search for one with !race <query>");
        });
    }
}