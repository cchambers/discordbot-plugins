var request = require("request");
var AuthDetails = require("../../auth.json");

var fs = require('fs');
var path = require('path');

var diretoryTreeToObj = function(dir, done) {
    var results = [];

    fs.readdir(dir, function(err, list) {
        if (err)
            return done(err);

        var pending = list.length;

        if (!pending)
            return done(null, {name: path.basename(dir), type: 'folder', children: results});

        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                   
                } else {
                    var filename = path.basename(file)
                    results.push(filename.substr(0, filename.length-9).replace(/-/g, " "));
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};

var spellList;
var dirTree = ('/home/discordbot/plugins/Spells/data');

diretoryTreeToObj(dirTree, function(err, res){
    if(err)
        console.error(err);
    spellList = res;
});

function search(array, term) {
    var results;
    term = term.toLowerCase();
    results = array.filter(function(entry) {
        return entry.toLowerCase().indexOf(term) !== -1;
    });
    return results;
}


exports.commands = [
	"spell", // gives dnd 5e spell info on anything that matches
    "spells" // lists all spells in flat file database
];

exports.spell = {
	usage: "<search query>",
	description: "returns spell data",
	process: function(bot, msg, args) {
        var results = search(spellList, args);
        var others = [];
        if (results.length != 0 ) {
            var perfect = results.indexOf( args.toLowerCase() );
             
            if (perfect >= 0) {
                var holdarr = results;
                var single = results.splice(perfect, 1);
                others = results;
                results = single;
                console.log(results, others);
            }
            if (results.length > 1) {
                bot.sendMessage(msg.channel, "I found **" + results.length + "** spells matching that term: ```" + results.join(", ") + "```");
            } else {
                var file = results[0].replace(/\s/g, "-") + ".markdown";
                console.log("Trying to pull " + file); 
                var filename = '/home/discordbot/plugins/Spells/data/' + file;
                fs.readFile(filename, 'utf8', function (err, data) {
                    if (err) throw err;
                    var edits = data.split("---");
                    var title = results[0].toUpperCase();
                    // var tags = edits[1].match(/(?:tags:\s+")(.+)(?:")/g);
                    var meat = edits[2];
                    if (others.length > 0) {
                        bot.sendMessage(msg.channel, "I found **" + others.length + "** other spells matching that term: ```" + others.join(", ") + "```");
                    }
                    setTimeout( function () {
                         bot.sendMessage(msg.channel, "__**" + title + "**__ " + meat);
                    },200);
                });
            }
        } else {
            bot.sendMessage(msg.channel, "I have nothing on that...."); 
        }
	}
}


exports.spells = {
	usage: "<search query>",
	description: "returns spell list count",
	process: function(bot, msg, args) {
        bot.sendMessage(msg.channel, "I have data on " + spellList.length + " spells. Search for one with !spell <spellname>"); 
	}
}
